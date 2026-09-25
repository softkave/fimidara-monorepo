import {kIjxSemantic, kIjxUtils} from '../../../contexts/ijx/injectables.js';
import {
  File,
  kImageDimensionsStatus,
  kImageExts,
} from '../../../definitions/file.js';
import {isProcessableImageFile} from '../readFile/imageFormat.js';
import {probeAndPersistImageDimensions} from './probeImageDimensions.js';

const kDefaultPageSize = 100;
const kDefaultConcurrency = 10;

export type BackfillImageDimensionsResult = {
  scanned: number;
  probed: number;
  ready: number;
  failed: number;
  unsupported: number;
  skipped: number;
};

type BackfillImageDimensionsFileDelta = BackfillImageDimensionsResult;

/**
 * Page image-like files that are not yet `ready` and probe their dimensions.
 */
export async function backfillImageDimensionsFromFiles(params?: {
  pageSize?: number;
  concurrency?: number;
}): Promise<BackfillImageDimensionsResult> {
  const pageSize = params?.pageSize ?? kDefaultPageSize;
  const concurrency = params?.concurrency ?? kDefaultConcurrency;
  const result: BackfillImageDimensionsResult = {
    scanned: 0,
    probed: 0,
    ready: 0,
    failed: 0,
    unsupported: 0,
    skipped: 0,
  };

  let page = 0;
  for (;;) {
    // Always page 0: successful probes drop out of the query; using an
    // advancing page would skip rows that shift down after updates.
    const files = (await kIjxSemantic.file().getManyByQuery(
      {
        $or: [{mimetype: {$regex: /^image\//i}}, {ext: {$in: kImageExts}}],
        imageDimensionsStatus: {
          $in: [null, kImageDimensionsStatus.pending],
        },
      },
      {
        page: 0,
        pageSize,
        sort: {resourceId: 'asc'},
        projection: {resourceId: 1, mimetype: 1, ext: 1},
      }
    )) as Pick<File, 'resourceId' | 'mimetype' | 'ext'>[];

    if (files.length === 0) {
      break;
    }

    for (let i = 0; i < files.length; i += concurrency) {
      const batch = files.slice(i, i + concurrency);
      const deltas = await Promise.allSettled(
        batch.map(file => processOneFile(file))
      );
      for (const delta of deltas) {
        if (delta.status === 'fulfilled') {
          mergeBackfillResult(result, delta.value);
        } else {
          mergeBackfillResult(result, {
            scanned: 1,
            probed: 0,
            ready: 0,
            failed: 1,
            unsupported: 0,
            skipped: 0,
          });
          kIjxUtils.logger().error({
            message: 'Backfill image dimensions failed',
            fileId: batch[i].resourceId,
            error: delta.reason,
          });
        }
      }
    }

    if (files.length < pageSize) {
      break;
    }

    page += 1;
    if (page > 10_000) {
      kIjxUtils.logger().error({
        message: 'Backfill image dimensions aborted: too many pages',
      });
      break;
    }
  }

  return result;
}

function mergeBackfillResult(
  result: BackfillImageDimensionsResult,
  delta: BackfillImageDimensionsFileDelta
) {
  result.scanned += delta.scanned;
  result.probed += delta.probed;
  result.ready += delta.ready;
  result.failed += delta.failed;
  result.unsupported += delta.unsupported;
  result.skipped += delta.skipped;
}

async function processOneFile(
  file: Pick<File, 'resourceId' | 'mimetype' | 'ext'>
): Promise<BackfillImageDimensionsFileDelta> {
  const delta: BackfillImageDimensionsFileDelta = {
    scanned: 1,
    probed: 0,
    ready: 0,
    failed: 0,
    unsupported: 0,
    skipped: 0,
  };

  if (!isProcessableImageFile(file)) {
    delta.skipped += 1;
    return delta;
  }

  delta.probed += 1;
  const {file: updated} = await probeAndPersistImageDimensions(file.resourceId);

  switch (updated.imageDimensionsStatus) {
    case kImageDimensionsStatus.ready:
      delta.ready += 1;
      break;
    case kImageDimensionsStatus.failed:
      delta.failed += 1;
      break;
    case kImageDimensionsStatus.unsupported:
      delta.unsupported += 1;
      break;
    default:
      break;
  }

  kIjxUtils.logger().log({
    message: 'Backfilled image dimensions',
    fileId: file.resourceId,
    status: updated.imageDimensionsStatus,
    imageWidth: updated.imageWidth,
    imageHeight: updated.imageHeight,
  });

  return delta;
}
