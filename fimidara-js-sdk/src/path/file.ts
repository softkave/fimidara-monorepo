import {compact, map} from 'lodash-es';
import {kDefaultServerURL} from '../constants.js';
import {
  ImageFormatEnum,
  ImageResizeFitEnum,
  ImageResizePositionEnum,
} from '../endpoints/publicTypes.js';
import {fimidaraAddRootnameToPath} from './fimidaraAddRootnameToPath.js';

/**
 * Configuration for generating fimidara file read URLs
 */
export type GetFimidaraReadFileURLProps = {
  /** Filepath including workspace rootname OR file presigned path. */
  filepath?: string;

  /** Filepath without workspace rootname. Does not accept file presigned paths.
   * You must also provide `workspaceRootname` */
  filepathWithoutRootname?: string;

  /** Workspace rootname, required if you're using `filepathWithoutRootname` */
  workspaceRootname?: string;

  /** Server URL, for if you're hosting you're own fimidara, or prefer a certain
   * host */
  serverURL?: string;

  /** Resize image to width */
  width?: number;

  /** Resize image to height */
  height?: number;

  /** How the image should be resized to fit both provided dimensions.
   * (optional, default 'cover') */
  fit?: ImageResizeFitEnum;

  /** Position, gravity or strategy to use when fit is cover or contain.
   * (optional, default 'centre') */
  position?: number | ImageResizePositionEnum;

  /** Background colour when using a fit of contain, defaults to black without
   * transparency. (optional, default {r:0,g:0,b:0,alpha:1}) */
  background?: string;

  /** Do not enlarge if the width or height are already less than the specified
   * dimensions. (optional, default false) */
  withoutEnlargement?: boolean;

  /** Output image format when transforming */
  format?: ImageFormatEnum;

  /** Whether the server should add "Content-Disposition: attachment" header
   * which forces browsers to download files like HTML, JPEG, etc. which it'll
   * otherwise open in the browser */
  download?: boolean;
  /** Custom filename for "Content-Disposition: attachment" responses */
  downloadName?: string;
};

const kReadFileQueryMap: Partial<
  Record<keyof GetFimidaraReadFileURLProps, string>
> = {
  width: 'w',
  height: 'h',
  fit: 'fit',
  position: 'pos',
  background: 'bg',
  withoutEnlargement: 'withoutEnlargement',
  format: 'format',
  download: 'download',
  downloadName: 'downloadName',
};

function getFilepath(props: {
  /** Filepath including workspace rootname OR file presigned path. */
  filepath?: string;
  workspaceRootname?: string;

  /** Filepath without workspace rootname. Does not accept file presigned paths. */
  filepathWithoutRootname?: string;
}) {
  const filepath = props.filepath
    ? props.filepath
    : props.filepathWithoutRootname && props.workspaceRootname
    ? fimidaraAddRootnameToPath(
        props.filepathWithoutRootname,
        props.workspaceRootname
      )
    : undefined;

  if (!filepath) throw new Error('Filepath not provided');
  return filepath;
}

/**
 * Generates a URL for reading/downloading a file from fimidara
 * @param props - Configuration for the file read URL
 * @returns The complete URL for reading the file
 * @example
 * ```typescript
 * const url = getFimidaraReadFileURL({
 *   filepath: '/workspace/path/to/file.jpg',
 *   width: 600,
 *   height: 400,
 *   fit: 'cover',
 *   format: 'webp',
 * });
 *
 * // Returns: https://fimidara.com/v1/files/readFile/workspace/path/to/file.jpg?w=600&h=400&fit=cover&format=webp
 * ```
 */
export function getFimidaraReadFileURL(props: GetFimidaraReadFileURLProps) {
  let query = '';
  const filepath = getFilepath(props);
  const queryList = compact(
    map(props, (v, k) => {
      const qk = kReadFileQueryMap[k as keyof GetFimidaraReadFileURLProps];
      if (!qk || v === undefined || v === null || v === '') return undefined;
      return `${qk}=${encodeURIComponent(String(v))}`;
    })
  );

  if (queryList.length) {
    query = `?${queryList.join('&')}`;
  }

  return (
    (props.serverURL || kDefaultServerURL) +
    '/v1/files/readFile/' +
    encodeURIComponent(
      filepath.startsWith('/') ? filepath.slice(1) : filepath
    ) +
    query
  );
}

/**
 * Generates a URL for uploading a file to fimidara
 * @param props - Configuration for the file upload URL
 * @returns The complete URL for uploading the file
 * @example
 * ```typescript
 * const url = getFimidaraUploadFileURL({
 *   filepathWithoutRootname: 'path/to/file.jpg',
 *   workspaceRootname: 'my-workspace'
 * });
 * ```
 */
export function getFimidaraUploadFileURL(props: {
  /** Filepath including workspace rootname OR file presigned path. */
  filepath?: string;

  /** Filepath without workspace rootname. Does not accept file presigned paths.
   * You must also provide `workspaceRootname` */
  filepathWithoutRootname?: string;

  /** Workspace rootname, required if you're using `filepathWithoutRootname` */
  workspaceRootname?: string;

  /** Server URL, for if you're hosting you're own fimidara, or prefer a certain
   * host */
  serverURL?: string;
}) {
  const filepath = getFilepath(props);
  return (
    (props.serverURL || kDefaultServerURL) +
    '/v1/files/uploadFile/' +
    encodeURIComponent(filepath.startsWith('/') ? filepath.slice(1) : filepath)
  );
}

/**
 * Combines a filename and extension into a single string
 * @param file - Object containing name and optional extension
 * @returns The complete filename with extension
 * @example
 * ```typescript
 * const filename = stringifyFimidaraFilename({ name: 'document', ext: 'pdf' });
 * // Returns: 'document.pdf'
 * ```
 */
export function stringifyFimidaraFilename(file: {name: string; ext?: string}) {
  const name = file.name + (file.ext ? `.${file.ext}` : '');
  return name;
}

/**
 * Combines file path components into a complete filepath string
 * @param file - Object containing namepath array and optional extension
 * @param rootname - Optional workspace rootname to prepend
 * @returns The complete filepath with optional workspace rootname
 * @example
 * ```typescript
 * const filepath = stringifyFimidaraFilepath({
 *   namepath: ['folder', 'subfolder', 'file'],
 *   ext: 'txt'
 * }, 'my-workspace');
 * // Returns: 'my-workspace/folder/subfolder/file.txt'
 * ```
 */
export function stringifyFimidaraFilepath(
  file: {namepath: string[]; ext?: string},
  rootname?: string
) {
  const name = file.namepath.join('/') + (file.ext ? `.${file.ext}` : '');
  return rootname ? fimidaraAddRootnameToPath(name, rootname) : name;
}
