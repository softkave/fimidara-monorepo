import {diffFiles} from '../diff/diffFiles.js';
import {File as FimidaraFile} from '../endpoints/publicTypes.js';
import {getNodeDirContent} from './getNodeDirContent.js';

/**
 * Type guard to check if the props contain existing directory content
 * @param props - Partial directory content object
 * @returns True if props contains all required directory content properties
 */
function isExistingDirContent(
  props: Partial<Awaited<ReturnType<typeof getNodeDirContent>>>
): props is Awaited<ReturnType<typeof getNodeDirContent>> {
  return !!(
    props.externalFilesRecord &&
    props.fileStatsRecord &&
    props.folderStatsRecord
  );
}

/**
 * Compares local Node.js filesystem content with fimidara files to identify differences
 * @template TFimidaraFile - Type extending FimidaraFile with required properties
 * @param props - Configuration object containing folder path and fimidara files
 * @param props.folderpath - Local filesystem path to compare
 * @param props.fimidaraFiles - Array or record of fimidara files to compare against
 * @param props.externalFilesRecord - Optional pre-fetched external files record
 * @param props.fileStatsRecord - Optional pre-fetched file stats record
 * @param props.folderStatsRecord - Optional pre-fetched folder stats record
 * @returns Promise resolving to directory content and diff results
 */
export async function diffNodeFiles<
  TFimidaraFile extends Pick<
    FimidaraFile,
    'name' | 'ext' | 'lastUpdatedAt'
  > = Pick<FimidaraFile, 'name' | 'ext' | 'lastUpdatedAt'>
>(
  props: {
    folderpath: string;
    fimidaraFiles: TFimidaraFile[] | Record<string, TFimidaraFile>;
  } & Partial<Awaited<ReturnType<typeof getNodeDirContent>>>
) {
  const {folderpath, fimidaraFiles} = props;
  const dirContent = isExistingDirContent(props)
    ? props
    : await getNodeDirContent({folderpath});

  const diffResult = diffFiles({
    fimidaraFiles,
    externalFiles: dirContent.externalFilesRecord,
  });

  return {...dirContent, ...diffResult};
}
