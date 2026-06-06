import {File} from '../../../definitions/file.js';
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
