import {getLocalFsDirFromSuppliedConfig} from '../contexts/file/LocalFsFilePersistenceProvider.js';
import {getAWSS3ConfigFromSuppliedConfig} from '../contexts/file/S3FilePersistenceProvider.js';
import {kIjxUtils} from '../contexts/ijx/injectables.js';
import {
  MoveFromS3Config,
  moveFromS3ToFS,
} from '../tools/move-from-s3/moveFromS3ToFS.js';

export default async function SCRIPT_moveFromS3ToLocalFS() {
  if (process.env.NODE_ENV !== 'production') {
    kIjxUtils.logger().log('Skipping move from S3 to local FS');
    return;
  }

  const config = kIjxUtils.suppliedConfig();
  const s3Config = getAWSS3ConfigFromSuppliedConfig(config);
  const {localFsDir} = getLocalFsDirFromSuppliedConfig();

  const options: MoveFromS3Config = {
    bucketName: s3Config.bucket,
    destinationPath: localFsDir,
    awsConfig: {
      region: s3Config.region,
      credentials: {
        accessKeyId: s3Config.accessKeyId,
        secretAccessKey: s3Config.secretAccessKey,
      },
    },
    concurrency: 10,
  };

  const stats = await moveFromS3ToFS(options);
  kIjxUtils.logger().log({
    message: 'Move from S3 completed',
    totalFiles: stats.totalFiles,
    filesProcessed: stats.filesProcessed,
    skippedFiles: stats.skippedFiles,
    errorsCount: stats.errors.length,
  });

  if (stats.errors.length > 0) {
    stats.errors.forEach(({key, error}) => {
      kIjxUtils.logger().error({
        message: 'Error moving file from S3 to local FS',
        reason: error,
        key,
      });
    });
  }
}
