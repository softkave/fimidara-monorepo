import {compact} from 'lodash-es';
import sharp from 'sharp';
import {PassThrough, Readable} from 'stream';
import {kSessionUtils} from '../../../contexts/SessionContext.js';
import {
  checkAuthorizationWithAgent,
  getFilePermissionContainers,
} from '../../../contexts/authorizationChecks/checkAuthorizaton.js';
import {
  FilePersistenceGetFileParams,
  FilePersistenceProvider,
} from '../../../contexts/file/types.js';
import {kIjxSemantic, kIjxUtils} from '../../../contexts/ijx/injectables.js';
import {incrementBandwidthOutUsageRecord} from '../../../contexts/usage/usageFns.js';
import {File} from '../../../definitions/file.js';
import {kFimidaraPermissionActions} from '../../../definitions/permissionItem.js';
import {isObjectFieldsEmpty} from '../../../utils/fns.js';
import {validate} from '../../../utils/validate.js';
import {getBackendConfigsWithIdList} from '../../fileBackends/configUtils.js';
import {
  getResolvedMountEntries,
  initBackendProvidersForMounts,
  resolveMountsForFolder,
} from '../../fileBackends/mountUtils.js';
import {RangeNotSatisfiableError} from '../errors.js';
import {getFileWithMatcher} from '../getFilesWithMatcher.js';
import {assertFile, stringifyFilenamepath} from '../utils.js';
import {ReadFileEndpoint} from './types.js';
import {generateETag, parseRangeHeader, validateIfRange} from './utils.js';
import {readFileJoiSchema} from './validation.js';

interface ViableBackend {
  entry: Awaited<ReturnType<typeof getResolvedMountEntries>>[0];
  mount: Awaited<ReturnType<typeof resolveMountsForFolder>>['mounts'][0];
  backend: FilePersistenceProvider;
}

/**
 * Resolves and returns viable backends for a file.
 * A viable backend is one that has both a mount and an initialized provider.
 */
async function getViableBackends(file: File): Promise<ViableBackend[]> {
  const {mounts, mountsMap} = await resolveMountsForFolder({
    workspaceId: file.workspaceId,
    namepath: file.namepath.slice(0, -1),
  });
  const configs = await getBackendConfigsWithIdList(
    compact(mounts.map(mount => mount.configId))
  );
  const providersMap = await initBackendProvidersForMounts(mounts, configs);
  const resolvedEntries = await getResolvedMountEntries(file.resourceId);

  const viableBackends: ViableBackend[] = [];

  for (const entry of resolvedEntries) {
    const mount = mountsMap[entry.mountId];
    if (!mount) {
      continue;
    }

    const backend = providersMap[mount.resourceId];
    if (!backend) {
      continue;
    }

    viableBackends.push({entry, mount, backend});
  }

  return viableBackends;
}

const readFile: ReadFileEndpoint = async reqData => {
  const data = validate(reqData.data, readFileJoiSchema);
  const agent = await kIjxUtils
    .session()
    .getAgentFromReq(
      reqData,
      kSessionUtils.permittedAgentTypes.api,
      kSessionUtils.accessScopes.api
    );

  const file = await kIjxSemantic.utils().withTxn(async opts => {
    const {file, presignedPath} = await getFileWithMatcher({
      presignedPathAction: kFimidaraPermissionActions.readFile,
      incrementPresignedPathUsageCount: true,
      supportPresignedPath: true,
      matcher: data,
      opts,
    });

    // If there's `presignedPath`, then permission is already checked
    if (!presignedPath && file) {
      await checkAuthorizationWithAgent({
        target: {
          action: kFimidaraPermissionActions.readFile,
          targetId: getFilePermissionContainers(
            file.workspaceId,
            file,
            /** include resource ID */ true
          ),
        },
        workspaceId: file.workspaceId,
        agent,
        opts,
      });
    }

    return file;
  });

  assertFile(file);
  await incrementBandwidthOutUsageRecord({
    agent,
    file,
    requestId: reqData.requestId,
    action: kFimidaraPermissionActions.readFile,
  });

  const isImageResizeEmpty = isObjectFieldsEmpty(data.imageResize ?? {});
  const hasImageTransform = !isImageResizeEmpty || !!data.imageFormat;

  // Use file metadata from the File object (lastUpdatedAt and size are already
  // available)
  const lastModified = file.lastUpdatedAt;
  const fileSize = file.size ?? 0;
  const etag = generateETag(lastModified, fileSize);

  // Parse Range header if present (and not already parsed from body). Range
  // header is extracted from HTTP layer and passed as parameter
  let ranges = data.ranges;
  if (!ranges && !hasImageTransform && data.rangeHeader) {
    if (fileSize > 0) {
      // Check If-Range header for conditional range requests
      const shouldHonorRange =
        !data.ifRangeHeader ||
        validateIfRange(data.ifRangeHeader, lastModified, etag);

      if (shouldHonorRange) {
        ranges = parseRangeHeader(data.rangeHeader, fileSize) ?? undefined;
        // If range header was provided but parsing failed, throw error
        if (!ranges) {
          throw new RangeNotSatisfiableError({fileSize});
        }
      }
    } else {
      // Range requested on empty file - invalid
      throw new RangeNotSatisfiableError({fileSize: 0});
    }
  }

  // Disable ranges when image transforms are requested (ranges don't make sense
  // with transformed images)
  if (hasImageTransform) {
    ranges = undefined;
  }

  const persistedFileResult = await readPersistedFile(file, ranges);
  const streams = persistedFileResult.streams;
  const isMultipart = ranges ? streams.length > 1 : undefined;

  if (hasImageTransform && streams.length > 0) {
    const outputStream = new PassThrough();
    const transformer = sharp();
    if (data.imageResize && !isImageResizeEmpty) {
      transformer.resize({
        withoutEnlargement: data.imageResize.withoutEnlargement,
        background: data.imageResize.background,
        position: data.imageResize.position,
        height: data.imageResize.height,
        width: data.imageResize.width,
        fit: data.imageResize.fit,
      });
    }

    if (data.imageFormat) {
      transformer.toFormat(data.imageFormat);
    } else {
      transformer.toFormat('png');
    }

    streams[0].pipe(transformer).pipe(outputStream);
    return {
      contentLength: persistedFileResult.size,
      mimetype: 'image/png',
      stream: outputStream,
      name: file.name,
      ext: file.ext,
      lastModified,
      etag,
    };
  } else {
    return {
      mimetype: file.mimetype ?? 'application/octet-stream',
      stream: isMultipart ? streams : streams[0] ?? Readable.from([]),
      contentLength: persistedFileResult.size,
      name: file.name,
      ext: file.ext,
      lastModified,
      etag,
      ranges: persistedFileResult.ranges,
      isMultipart,
    };
  }
};

interface ReadPersistedFileResult {
  streams: Readable[];
  size?: number;
  ranges?: Array<{start: number; end: number}>;
}

async function readPersistedFile(
  file: File,
  ranges?: Array<{start: number; end: number}>
): Promise<ReadPersistedFileResult> {
  const viableBackends = await getViableBackends(file);

  if (viableBackends.length === 0) {
    return {
      streams: [],
      size: 0,
    };
  }

  // Try each backend until one succeeds
  for (const {entry, mount, backend} of viableBackends) {
    try {
      const filepath = stringifyFilenamepath({
        namepath: entry.backendNamepath,
        ext: entry.backendExt,
      });

      const readFileParams = {
        filepath,
        workspaceId: file.workspaceId,
        fileId: entry.forId,
        mount,
      } satisfies Partial<FilePersistenceGetFileParams>;

      // Handle ranges (single or multipart)
      if (ranges && ranges.length > 0) {
        const streams: Readable[] = [];
        for (const range of ranges) {
          const persistedFile = await backend.readFile({
            ...readFileParams,
            rangeStart: range.start,
            rangeEnd: range.end,
          });

          if (persistedFile?.body) {
            streams.push(persistedFile.body);
          }
        }

        if (streams.length > 0) {
          return {
            streams,
            size: file.size,
            ranges,
          };
        }
      } else {
        // Handle full file (no ranges)
        const persistedFile = await backend.readFile(readFileParams);

        if (persistedFile?.body) {
          return {
            streams: [persistedFile.body],
            size: persistedFile.size,
          };
        }
      }
    } catch (error) {
      kIjxUtils.logger().error({
        message: 'Error reading persisted file',
        reason: error,
        fileId: file.resourceId,
        mountId: entry.mountId,
        resolvedEntryId: entry.resourceId,
      });
      // Continue to next backend
    }
  }

  // No backend succeeded
  return {
    streams: [],
    size: 0,
  };
}

export default readFile;
