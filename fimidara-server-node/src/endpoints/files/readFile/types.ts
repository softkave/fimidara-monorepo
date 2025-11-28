import {Readable} from 'stream';
import {ValueOf} from 'type-fest';
import {FileMatcher} from '../../../definitions/file.js';
import {Endpoint} from '../../types.js';

export const ImageResizeFitEnumMap = {
  contain: 'contain',
  cover: 'cover',
  fill: 'fill',
  inside: 'inside',
  outside: 'outside',
} as const;

export const ImageResizePositionEnumMap = {
  top: 'top',
  rightTop: 'right top',
  right: 'right',
  rightBottom: 'right bottom',
  bottom: 'bottom',
  leftBottom: 'left bottom',
  left: 'left',
  leftTop: 'left top',
  north: 'north',
  northeast: 'northeast',
  east: 'east',
  southeast: 'southeast',
  south: 'south',
  southwest: 'southwest',
  west: 'west',
  northwest: 'northwest',
  centre: 'centre',

  /** focus on the region with the highest Shannon entropy. */
  entropy: 'entropy',

  /** focus on the region with the highest luminance frequency, colour
   * saturation and presence of skin tones. */
  attention: 'attention',
} as const;

export type ImageResizeFitEnum = ValueOf<typeof ImageResizeFitEnumMap>;
export type ImageResizePositionEnum = ValueOf<
  typeof ImageResizePositionEnumMap
>;

export type ImageResizeParams = {
  width?: number;
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
};

export const ImageFormatEnumMap = {
  jpeg: 'jpeg',
  png: 'png',
  webp: 'webp',
  tiff: 'tiff',
  raw: 'raw',

  // TODO: support gif
} as const;
export type ImageFormatEnum = ValueOf<typeof ImageFormatEnumMap>;

export type ReadFileEndpointParams = {
  imageResize?: ImageResizeParams;
  imageFormat?: ImageFormatEnum;
  /** Used by HTTP layer to add `"Content-Disposition: attachment"` if `true` */
  download?: boolean;
  /** Array of byte ranges to request. For single range, array has one element.
   * For multipart ranges, array has multiple elements. */
  ranges?: Array<{start: number; end: number}>;
  /** Raw Range header value extracted from HTTP request (for parsing after file
   * size is known) */
  rangeHeader?: string;
  /** Raw If-Range header value extracted from HTTP request */
  ifRangeHeader?: string;
} & FileMatcher;

export interface ReadFileEndpointResult {
  contentLength?: number;
  mimetype?: string;
  stream: Readable | Readable[];
  name: string;
  ext?: string;
  /** Last modified timestamp in milliseconds */
  lastModified?: number;
  /** ETag for cache validation */
  etag?: string;
  /** Array of ranges that were returned. Present when ranges were requested. */
  ranges?: Array<{start: number; end: number}>;
  /** True if this is a multipart response (multiple streams) */
  isMultipart?: boolean;
}

export type ReadFileEndpoint = Endpoint<
  ReadFileEndpointParams,
  ReadFileEndpointResult
>;

export type ReadFileEndpointHttpQuery = {
  w?: number;
  h?: number;
  fit?: ImageResizeFitEnum;
  pos?: number | ImageResizePositionEnum;
  bg?: string;
  withoutEnlargement?: boolean;
  format?: ImageFormatEnum;
  download?: boolean;
};
