import {File, PublicFile} from '../../../definitions/file.js';
import {PublicWorkspaceResource} from '../../../definitions/system.js';
import {getFields} from '../../../utils/extract.js';
import {workspaceResourceFields} from '../../extractors.js';

type PublicFileBaseFields = Pick<
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
> &
  PublicWorkspaceResource;

export const fileFields = getFields<PublicFileBaseFields>({
  ...workspaceResourceFields,
  name: true,
  description: true,
  parentId: true,
  mimetype: true,
  size: true,
  encoding: true,
  ext: true,
  idPath: true,
  namepath: true,
  version: true,
});

export function computeAspectRatio(
  file: Pick<File, 'imageWidth' | 'imageHeight'>
): number | undefined {
  const w = file.imageWidth;
  const h = file.imageHeight;
  if (w == null || h == null || w <= 0 || h <= 0) {
    return undefined;
  }
  return w / h;
}

function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

/**
 * Human-readable aspect ratio for display (e.g. 1920×1080 → "16:9").
 * Odd pixel sizes that don't simplify cleanly return a short decimal instead.
 */
export function formatAspectRatioLabel(
  width: number,
  height: number
): string {
  const divisor = gcd(width, height);
  const w = Math.round(width / divisor);
  const h = Math.round(height / divisor);
  if (w > 50 || h > 50) {
    return `${(width / height).toFixed(4)}`;
  }
  return `${w}:${h}`;
}

export function withPublicFileAspectRatio(
  file: Omit<PublicFile, 'aspectRatio' | 'aspectRatioLabel' | 'read' | 'write'> &
    Pick<PublicFile, 'read' | 'write'>
): PublicFile {
  const aspectRatio = computeAspectRatio(file);
  if (aspectRatio === undefined) {
    return file;
  }

  const w = file.imageWidth;
  const h = file.imageHeight;
  const aspectRatioLabel =
    w != null && h != null ? formatAspectRatioLabel(w, h) : undefined;

  return {
    ...file,
    aspectRatio,
    ...(aspectRatioLabel ? {aspectRatioLabel} : {}),
  };
}
