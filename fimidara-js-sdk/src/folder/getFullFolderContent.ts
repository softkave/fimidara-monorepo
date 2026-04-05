import {
  FimidaraEndpoints,
  FoldersEndpoints,
} from '../endpoints/publicEndpoints.js';
import {File, Folder} from '../endpoints/publicTypes.js';

/**
 * Retrieves all files and folders from a specified folder by paginating through
 * all available content.
 *
 * This function automatically handles pagination to fetch all content in a
 * single call, making it convenient for cases where you need the complete
 * folder contents without managing pagination manually.
 *
 * @param fimidara - The fimidara SDK instance with authenticated endpoints
 * @param listParams - Parameters for listing folder content (folderId,
 * workspaceId, etc.)
 * @returns Promise resolving to an object containing all files and folders in
 * the specified folder
 *
 * @example
 * ```typescript
 * const content = await getFullFolderContent(fimidara, {
 *   folderId: 'folder-123',
 *   workspaceId: 'workspace-456'
 * });
 * console.log(`Found ${content.files.length} files and ${content.folders.length} folders`);
 * ```
 */
export async function getFullFolderContent(
  fimidara: InstanceType<typeof FimidaraEndpoints>,
  listParams: Parameters<
    InstanceType<typeof FoldersEndpoints>['listFolderContent']
  >[0]
) {
  let files: File[] = [];
  let folders: Folder[] = [];
  let pageFiles: File[] | undefined;
  let pageFolders: Folder[] | undefined;
  let page = 0;

  do {
    const response = await fimidara.folders.listFolderContent({
      page,
      ...listParams,
    });

    pageFiles = response.files;
    pageFolders = response.folders;
    files = files.concat(pageFiles);
    folders = folders.concat(pageFolders);
    page++;
  } while (pageFiles?.length || pageFolders?.length);

  return {files, folders};
}
