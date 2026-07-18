import assert from 'assert';
import {BusboyConfig} from 'busboy';
import {kIjxUtils} from '../../contexts/ijx/injectables.js';
import {kEndpointConstants} from '../constants.js';

const maxFileSizeInBytes = 1024 * 1024 ** 2; // 2Gb
const multipartLimits: BusboyConfig['limits'] = {
  fields: 1,
  files: 1,
  fieldSize: maxFileSizeInBytes,
  fileSize: maxFileSizeInBytes,
};

export const kFileConstants = {
  maxFileSizeInBytes,
  multipartLimits,
  nameExtSeparator: '.',
  maxMimeTypeCharLength: 100,
  maxEncodingCharLength: 100,
  maxExtCharLength: 100,
  maxFileWidth: 5000, // px
  maxFileHeight: 5000, // px
  /** Max width*height for resize requests (25 megapixels). */
  maxImagePixelArea: 25_000_000,
  /** Default AVIF encode quality (lower = smaller/faster). */
  defaultAvifQuality: 50,
  /** How often to touch derivative mtime for eviction (ms). */
  imageDerivativeAccessTouchIntervalMs: 60 * 60 * 1000, // 1 hour
  /** Delete local derivatives idle longer than this (ms). */
  imageDerivativeRetentionMs: 30 * 24 * 60 * 60 * 1000, // 30 days
  /** How often the eviction sweep runs (ms). */
  imageDerivativeEvictionIntervalMs: 60 * 60 * 1000, // 1 hour
  /** Timeout waiting for a derivative file lock (ms). */
  imageDerivativeLockTimeoutMs: 30_000,
  /** Max idle derivatives deleted per eviction sweep (rest wait for next tick). */
  imageDerivativeEvictionMaxDeletes: 500,
  /** Cache-Control for on-the-fly image transform responses. */
  defaultImageTransformCacheControl: 'public, max-age=31536000, immutable',
  getImageTransformCacheControl: () =>
    kIjxUtils.suppliedConfig().imageTransformCacheControl ||
    kFileConstants.defaultImageTransformCacheControl,
  getDefaultImageDerivativeCacheDir: () => {
    const localFsDir = kIjxUtils.suppliedConfig().localFsDir;
    return localFsDir
      ? `${localFsDir}/.fimidara-image-derivatives`
      : './local-fs/.fimidara-image-derivatives';
  },
  getImageDerivativeCacheDir: () =>
    kIjxUtils.suppliedConfig().imageDerivativeCacheDir ||
    kFileConstants.getDefaultImageDerivativeCacheDir(),
  getImageDerivativeLockTimeoutMs: () =>
    kFileConstants.imageDerivativeLockTimeoutMs,
  getImageDerivativeAccessTouchIntervalMs: () =>
    kFileConstants.imageDerivativeAccessTouchIntervalMs,
  getImageDerivativeRetentionMs: () =>
    kIjxUtils.suppliedConfig().imageDerivativeRetentionMs ??
    kFileConstants.imageDerivativeRetentionMs,
  getImageDerivativeEvictionIntervalMs: () =>
    kIjxUtils.suppliedConfig().imageDerivativeEvictionIntervalMs ??
    kFileConstants.imageDerivativeEvictionIntervalMs,
  getImageDerivativeEvictionMaxDeletes: () =>
    kFileConstants.imageDerivativeEvictionMaxDeletes,
  uploadedFileFieldName: 'data',
  maxClientMultipartIdLength: 100,
  maxUploadSessionIdLength: 100,
  routes: {
    readFile: `${kEndpointConstants.apiv1}/files/readFile`,
    readFile_get: `${kEndpointConstants.apiv1}/files/readFile/:filepathOrId`,
    deleteFile: `${kEndpointConstants.apiv1}/files/deleteFile`,
    getFileDetails: `${kEndpointConstants.apiv1}/files/getFileDetails`,
    updateFileDetails: `${kEndpointConstants.apiv1}/files/updateFileDetails`,
    uploadFile: `${kEndpointConstants.apiv1}/files/uploadFile`,
    // TODO: better implement divide between express paths and mddoc def
    uploadFile_post: `${kEndpointConstants.apiv1}/files/uploadFile/:filepathOrId`,
    listParts: `${kEndpointConstants.apiv1}/files/listParts`,
    startMultipartUpload: `${kEndpointConstants.apiv1}/files/startMultipartUpload`,
    completeMultipartUpload: `${kEndpointConstants.apiv1}/files/completeMultipartUpload`,
    abortUpload: `${kEndpointConstants.apiv1}/files/abortUpload`,
  },
  headers: {
    'x-fimidara-file-encoding': 'x-fimidara-file-encoding',
    'x-fimidara-file-description': 'x-fimidara-file-description',
    'x-fimidara-file-mimetype': 'x-fimidara-file-mimetype',
    'x-fimidara-file-size': 'x-fimidara-file-size',
    'x-fimidara-multipart-id': 'x-fimidara-multipart-id',
    'x-fimidara-multipart-part': 'x-fimidara-multipart-part',
    'x-fimidara-append': 'x-fimidara-append',
    'x-fimidara-on-append-create-if-not-exists': 'x-fimidara-on-append-create-if-not-exists',
    'x-fimidara-upload-session-id': 'x-fimidara-upload-session-id',
  } as const,
  getPartUploadLockKey: (fileId: string, part: number) =>
    `upload-file-${fileId}-${part}`,
  multipartLockTimeoutSeconds: 60 * 60 * 24, // 24 hours
  partResultCacheKeyPrefix: 'mpr_', // + multipartId + part hash
  getPartCacheKey: (multipartId: string, part: number) => {
    return `${kFileConstants.partResultCacheKeyPrefix}${multipartId}_${part}`;
  },
  addInternalMultipartIdQueueTimeout: 30_000,
  addInternalMultipartIdProcessCount: 100,
  getAddInternalMultipartIdPubSubChannel: (workspaceId: string) =>
    `${
      kIjxUtils.suppliedConfig().addInternalMultipartIdPubSubChannelPrefix
    }-${workspaceId}`,
  getAddInternalMultipartIdQueueWithNo: (num: number) =>
    `${kIjxUtils.suppliedConfig().addInternalMultipartIdQueuePrefix}${num}`,
  getAddInternalMultipartIdQueueKey: (workspaceId: string) => {
    const {addInternalMultipartIdQueueStart, addInternalMultipartIdQueueEnd} =
      kIjxUtils.suppliedConfig();

    assert.ok(addInternalMultipartIdQueueStart);
    assert.ok(addInternalMultipartIdQueueEnd);

    const queueCount =
      addInternalMultipartIdQueueEnd - addInternalMultipartIdQueueStart + 1;
    assert.ok(queueCount > 0);

    const hash = workspaceId.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);

    const key = kFileConstants.getAddInternalMultipartIdQueueWithNo(
      (hash % queueCount) + addInternalMultipartIdQueueStart
    );

    return key;
  },
  getAddInternalMultipartIdLockName: (fileId: string) =>
    `addInternalMultipartId:${fileId}`,
  getAddInternalMultipartIdLockWaitTimeoutMs: 1000 * 60 * 1, // 1 minute
  prepareFileQueueTimeout: 1000 * 60 * 1, // 1 minute
  prepareFileProcessCount: 100,
  getPrepareFilePubSubChannel: (workspaceId: string) =>
    `${
      kIjxUtils.suppliedConfig().prepareFilePubSubChannelPrefix
    }-${workspaceId}`,
  getPrepareFileQueueWithNo: (num: number) =>
    `${kIjxUtils.suppliedConfig().prepareFileQueuePrefix}${num}`,
  getPrepareFileQueueKey: (workspaceId: string) => {
    const {prepareFileQueueStart, prepareFileQueueEnd} =
      kIjxUtils.suppliedConfig();

    assert.ok(prepareFileQueueStart);
    assert.ok(prepareFileQueueEnd);

    const queueCount = prepareFileQueueEnd - prepareFileQueueStart + 1;
    assert.ok(queueCount > 0);

    const hash = workspaceId.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);

    const key = kFileConstants.getPrepareFileQueueWithNo(
      (hash % queueCount) + prepareFileQueueStart
    );

    return key;
  },
  getPrepareFileLockName: (filepathOrId: string) =>
    `prepareFile:${filepathOrId}`,
  getPrepareFileLockWaitTimeoutMs: 1000 * 60 * 1, // 1 minute
  minPartNumber: 1,
  maxPartNumber: 10_000,
};
