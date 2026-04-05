/**
 * Represents an external file for comparison with fimidara files. Contains the
 * minimum required properties for file diffing operations.
 */
export type FimidaraDiffExternalFile = Pick<File, 'name' | 'lastModified'>;
