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

export function withPublicFileAspectRatio(
  file: Omit<PublicFile, 'aspectRatio' | 'read' | 'write'> &
    Pick<PublicFile, 'read' | 'write'>
): PublicFile {
  const aspectRatio = computeAspectRatio(file);
  return aspectRatio === undefined ? file : {...file, aspectRatio};
}
