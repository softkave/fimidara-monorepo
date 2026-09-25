import {compact} from 'lodash-es';
import {Readable} from 'stream';
import {
  FilePersistenceGetFileParams,
  FilePersistenceProvider,
} from '../../../contexts/file/types.js';
import {kIjxUtils} from '../../../contexts/ijx/injectables.js';
import {File} from '../../../definitions/file.js';
import {getBackendConfigsWithIdList} from '../../fileBackends/configUtils.js';
import {
  getResolvedMountEntries,
  initBackendProvidersForMounts,
  resolveMountsForFolder,
} from '../../fileBackends/mountUtils.js';
import {stringifyFilenamepath} from '../utils.js';
import {Range} from './utils.js';

interface ViableBackend {
  entry: Awaited<ReturnType<typeof getResolvedMountEntries>>[0];
  mount: Awaited<ReturnType<typeof resolveMountsForFolder>>['mounts'][0];
  backend: FilePersistenceProvider;
}

/**
 * Resolves backends that have both a mount and an initialized provider.
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

export type ReadPersistedFileResult = {
  streams: Readable[];
  size?: number;
  ranges?: Range[];
};

/** Read file bytes from the first viable backend (full file or ranges). */
export async function readPersistedFile(
  file: File,
  ranges?: Range[]
): Promise<ReadPersistedFileResult> {
  const viableBackends = await getViableBackends(file);

  if (viableBackends.length === 0) {
    return {
      streams: [],
      size: 0,
    };
  }

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
    }
  }

  return {
    streams: [],
    size: 0,
  };
}
