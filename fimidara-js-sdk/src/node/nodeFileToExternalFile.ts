import assert from 'assert';
import {Dirent, Stats} from 'fs';
import {stat} from 'fs/promises';
import path from 'path-browserify';
import type {FimidaraDiffExternalFile} from '../diff/types.js';

/**
 * Converts a Node.js file or directory to a fimidara external file representation.
 *
 * @param props - Configuration object containing either a dirent or filepath
 * @param props.dirent - Optional Node.js Dirent object with parentPath and name
 * @param props.filepath - Optional absolute or relative file path
 * @returns Promise resolving to an object containing file stats and optional external file representation
 * @throws {AssertionError} When neither dirent nor filepath is provided
 */
export async function nodeFileToExternalFile(props: {
  dirent?: Pick<Dirent, 'parentPath' | 'name'>;
  filepath?: string;
}): Promise<{externalFile?: FimidaraDiffExternalFile; stats: Stats}> {
  const {filepath, dirent: df} = props;

  const fp = filepath
    ? filepath
    : df
    ? path.join(df.parentPath, df.name)
    : undefined;
  assert.ok(fp, 'nodeFileToExternalFile requires dirent or filepath');

  const stats = await stat(fp);
  return {
    stats,
    externalFile: stats.isFile()
      ? {
          name: df?.name || path.basename(fp, path.extname(fp)),
          lastModified: stats.mtimeMs,
        }
      : undefined,
  };
}
