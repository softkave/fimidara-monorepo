import {ValueOf} from 'type-fest';
import {FilePersistenceUploadPartResult} from '../contexts/file/types.js';
import {
  PublicWorkspaceResource,
  ToPublicDefinitions,
  WorkspaceResource,
} from './system.js';

export interface File extends WorkspaceResource {
  parentId: string | null;
  idPath: string[];
  namepath: string[];
  mimetype?: string;
  encoding?: string;
  size: number;
  name: string;
  ext?: string;
  description?: string;
  isWriteAvailable?: boolean;
  isReadAvailable?: boolean;
  /** uploadSessionId or agent id of the uploader that holds the write lock */
  writeLockedBy?: string | null;
  version: number;

  // multipart uploads
  internalMultipartId?: string | null;
  clientMultipartId?: string | null;
  /** timestamp in ms */
  multipartTimeout?: number | null;

  /** Display width in pixels after EXIF orientation (images only). */
  imageWidth?: number | null;
  /** Display height in pixels after EXIF orientation (images only). */
  imageHeight?: number | null;
  /** Probe state for imageWidth/imageHeight. */
  imageDimensionsStatus?: ImageDimensionsStatus | null;
}

export type ResourceAvailability = {
  available: boolean;
  availableForYou: boolean;
  lockedBy?: string;
};

export interface FilePart
  extends WorkspaceResource,
    FilePersistenceUploadPartResult {
  fileId: string;
  size: number;
}

export interface FileWithRuntimeData extends File {
  // server runtime only state, never stored in DB
  RUNTIME_ONLY_shouldCleanupMultipart?: boolean;
  RUNTIME_ONLY_internalMultipartId?: string | null;
}

export type PublicFile = PublicWorkspaceResource &
  ToPublicDefinitions<
    Pick<
      File,
      | 'parentId'
      | 'idPath'
      | 'namepath'
      | 'mimetype'
      | 'encoding'
      | 'size'
      | 'name'
      | 'ext'
      | 'description'
      | 'version'
    >
  > & {
    /** Display width in pixels after EXIF orientation when status is ready. */
    imageWidth?: number;
    /** Display height in pixels after EXIF orientation when status is ready. */
    imageHeight?: number;
    /** Probe state for imageWidth/imageHeight. */
    imageDimensionsStatus?: ImageDimensionsStatus;
    /** width / height when both image dimensions are present */
    aspectRatio?: number;
    read: ResourceAvailability;
    write: ResourceAvailability;
  };

export type FileMatcher = {
  /** file path with workspace rootname e.g rootname/folder/file.txt */
  filepath?: string;
  fileId?: string;
};

export type PublicPart = Pick<FilePart, 'part' | 'size'>;

export const kImageDimensionsStatus = {
  pending: 'pending',
  ready: 'ready',
  unsupported: 'unsupported',
  failed: 'failed',
} as const;

export type ImageDimensionsStatus = ValueOf<typeof kImageDimensionsStatus>;

export const ImageFormatEnumMap = {
  jpeg: 'jpeg',
  png: 'png',
  webp: 'webp',
  tiff: 'tiff',
  raw: 'raw',
  /** GIF encode (still images only). Animated GIF sources are rejected. */
  gif: 'gif',
  avif: 'avif',
} as const;
export type ImageFormatEnum = ValueOf<typeof ImageFormatEnumMap>;

export const kExtToFormat: Record<string, ImageFormatEnum> = {
  jpg: ImageFormatEnumMap.jpeg,
  jpeg: ImageFormatEnumMap.jpeg,
  png: ImageFormatEnumMap.png,
  webp: ImageFormatEnumMap.webp,
  tiff: ImageFormatEnumMap.tiff,
  tif: ImageFormatEnumMap.tiff,
  gif: ImageFormatEnumMap.gif,
  avif: ImageFormatEnumMap.avif,
  raw: ImageFormatEnumMap.raw,
};

export const kMimeToFormat: Record<string, ImageFormatEnum> = {
  'image/jpeg': ImageFormatEnumMap.jpeg,
  'image/jpg': ImageFormatEnumMap.jpeg,
  'image/png': ImageFormatEnumMap.png,
  'image/webp': ImageFormatEnumMap.webp,
  'image/tiff': ImageFormatEnumMap.tiff,
  'image/gif': ImageFormatEnumMap.gif,
  'image/avif': ImageFormatEnumMap.avif,
};

export const kFormatToMime: Record<ImageFormatEnum, string> = {
  [ImageFormatEnumMap.jpeg]: 'image/jpeg',
  [ImageFormatEnumMap.png]: 'image/png',
  [ImageFormatEnumMap.webp]: 'image/webp',
  [ImageFormatEnumMap.tiff]: 'image/tiff',
  [ImageFormatEnumMap.raw]: 'application/octet-stream',
  [ImageFormatEnumMap.gif]: 'image/gif',
  [ImageFormatEnumMap.avif]: 'image/avif',
};

export const kFormatToExt: Record<ImageFormatEnum, string> = {
  [ImageFormatEnumMap.jpeg]: 'jpg',
  [ImageFormatEnumMap.png]: 'png',
  [ImageFormatEnumMap.webp]: 'webp',
  [ImageFormatEnumMap.tiff]: 'tiff',
  [ImageFormatEnumMap.raw]: 'raw',
  [ImageFormatEnumMap.gif]: 'gif',
  [ImageFormatEnumMap.avif]: 'avif',
};

export const kImageExts = Array.from(
  new Set([...Object.keys(kExtToFormat), ...Object.values(kMimeToFormat)])
);
