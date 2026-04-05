import {Stats} from 'fs';
import {pathExists} from 'fs-extra';
import {opendir} from 'fs/promises';
import type {FimidaraDiffExternalFile} from '../diff/types.js';
import {nodeFileToExternalFile} from './nodeFileToExternalFile.js';

/**
 * Retrieves directory content and converts files to fimidara external file format.
 *
 * @param props - Configuration object
 * @param props.folderpath - Path to the directory to scan
 * @returns Object containing folder stats, file stats, and external files record
 */
export async function getNodeDirContent(props: {folderpath: string}) {
  const {folderpath} = props;
  const efRecord: Record<string, FimidaraDiffExternalFile> = {};
  const folderStatsRecord: Record<string, Stats> = {};
  const fileStatsRecord: Record<string, Stats> = {};

  if (await pathExists(folderpath)) {
    const dir = await opendir(folderpath);

    // TODO: optimize
    for await (const df of dir) {
      const {externalFile, stats} = await nodeFileToExternalFile({dirent: df});

      if (externalFile) {
        efRecord[externalFile.name] = externalFile;
        fileStatsRecord[externalFile.name] = stats;
      }

      if (stats.isDirectory()) {
        folderStatsRecord[df.name] = stats;
      }
    }
  }

  return {folderStatsRecord, fileStatsRecord, externalFilesRecord: efRecord};
}
