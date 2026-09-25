import {isNumber, pick} from 'lodash-es';
import {FilePersistenceUploadFileResult} from '../../../contexts/file/types.js';
import {kIjxSemantic} from '../../../contexts/ijx/injectables.js';
import {SemanticProviderMutationParams} from '../../../contexts/semantic/types.js';
import {File, kImageDimensionsStatus} from '../../../definitions/file.js';
import {Agent, SessionAgent} from '../../../definitions/system.js';
import {appAssert} from '../../../utils/assertion.js';
import {getTimestamp} from '../../../utils/dateFns.js';
import {mergeData} from '../../../utils/fns.js';
import {getActionAgentFromSessionAgent} from '../../../utils/sessionUtils.js';
import {getCleanupMultipartFileUpdate} from '../deleteFile/deleteMultipartUpload.js';
import {writeFileParts} from '../utils/filePart.js';
import {getNextMultipartTimeout} from '../utils/getNextMultipartTimeout.js';

export async function setFileWritable(fileId: string) {
  await kIjxSemantic.utils().withTxn(async opts => {
    await kIjxSemantic
      .file()
      .getAndUpdateOneById(
        fileId,
        {isWriteAvailable: true, writeLockedBy: null},
        opts
      );
  });
}

export async function saveFilePartData(params: {
  agent: SessionAgent;
  workspaceId: string;
  fileId: string;
  persistedMountData: FilePersistenceUploadFileResult<unknown>;
  size: number;
  opts: SemanticProviderMutationParams | null;
}) {
  const {persistedMountData, size, opts} = params;
  appAssert(isNumber(persistedMountData.part));
  appAssert(persistedMountData.multipartId && persistedMountData.partId);
  await writeFileParts({
    opts,
    agent: params.agent,
    workspaceId: params.workspaceId,
    fileId: params.fileId,
    multipartId: persistedMountData.multipartId,
    parts: [
      {
        size,
        part: persistedMountData.part,
        multipartId: persistedMountData.multipartId,
        partId: persistedMountData.partId,
      },
    ],
  });
}

export function getIntermediateMultipartFileUpdate(params: {
  agent: SessionAgent;
  data: Pick<File, 'description' | 'encoding' | 'mimetype'>;
  multipartId: string;
}) {
  const {agent, data, multipartId} = params;
  const update: Partial<File> = {
    lastUpdatedBy: getActionAgentFromSessionAgent(agent),
    lastUpdatedAt: getTimestamp(),
    isWriteAvailable: false,
    multipartTimeout: getNextMultipartTimeout(),
    internalMultipartId: multipartId,
  };

  mergeData(update, pick(data, ['description', 'encoding', 'mimetype']), {
    arrayUpdateStrategy: 'replace',
  });

  return update;
}

/** Clear image dims so they are re-probed after content changes. */
export function getResetImageDimensionsUpdate(): Partial<File> {
  return {
    imageWidth: null,
    imageHeight: null,
    imageDimensionsStatus: kImageDimensionsStatus.pending,
  };
}

export function getFinalFileUpdate(params: {
  agent: Agent;
  file: Pick<File, 'version' | 'size'>;
  data: Pick<File, 'description' | 'encoding' | 'mimetype'>;
  size: number;
  append?: boolean;
}) {
  const {agent, file, data, size, append} = params;
  // For append operations, add new size to existing size
  const finalSize = append ? (file.size || 0) + size : size;
  const update: Partial<File> = {
    lastUpdatedBy: agent,
    lastUpdatedAt: getTimestamp(),
    isWriteAvailable: true,
    isReadAvailable: true,
    version: file.version + 1,
    size: finalSize,
    // Bytes changed (replace or append) — re-probe dimensions.
    ...getResetImageDimensionsUpdate(),
  };

  mergeData(
    update,
    {
      ...getCleanupMultipartFileUpdate(),
      ...pick(data, ['description', 'encoding', 'mimetype']),
    },
    {arrayUpdateStrategy: 'replace'}
  );

  return update;
}
