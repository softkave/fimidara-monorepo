import {afterAll, beforeAll, describe, expect, test} from 'vitest';
import {kIjxSemantic, kIjxUtils} from '../../../contexts/ijx/injectables.js';
import {kImageDimensionsStatus} from '../../../definitions/file.js';
import {kGenerateTestFileType} from '../../testHelpers/generate/file/generateTestFileBinary.js';
import {completeTests} from '../../testHelpers/helpers/testFns.js';
import {
  initTests,
  insertFileForTest,
  insertUserForTest,
  insertWorkspaceForTest,
} from '../../testHelpers/utils.js';
import {backfillImageDimensionsFromFiles} from './backfillImageDimensions.js';

beforeAll(async () => {
  await initTests();
});

afterAll(async () => {
  await completeTests();
});

describe('backfillImageDimensionsFromFiles', () => {
  test('probes pending images and reports counts', async () => {
    const {userToken} = await insertUserForTest();
    const {workspace} = await insertWorkspaceForTest(userToken);

    const files = await Promise.all([
      insertFileForTest(
        userToken,
        workspace,
        {},
        kGenerateTestFileType.png,
        {width: 30, height: 20}
      ),
      insertFileForTest(
        userToken,
        workspace,
        {},
        kGenerateTestFileType.png,
        {width: 50, height: 25}
      ),
      insertFileForTest(
        userToken,
        workspace,
        {},
        kGenerateTestFileType.png,
        {width: 10, height: 10}
      ),
    ]);

    await kIjxUtils.promises().flush();

    const seededIds = files.map(({rawFile}) => rawFile.resourceId);

    for (const resourceId of seededIds) {
      await kIjxSemantic.utils().withTxn(async opts => {
        await kIjxSemantic.file().getAndUpdateOneById(
          resourceId,
          {
            imageWidth: null,
            imageHeight: null,
            imageDimensionsStatus: kImageDimensionsStatus.pending,
          },
          opts
        );
      });
    }

    const result = await backfillImageDimensionsFromFiles({
      pageSize: 2,
      concurrency: 2,
    });

    // Global scan may include leftover pending files from other tests.
    expect(result.scanned).toBeGreaterThanOrEqual(seededIds.length);
    expect(result.probed).toBeGreaterThanOrEqual(seededIds.length);
    expect(result.ready).toBeGreaterThanOrEqual(seededIds.length);

    for (const resourceId of seededIds) {
      const dbFile = await kIjxSemantic.file().assertGetOneByQuery({
        resourceId,
      });
      expect(dbFile.imageDimensionsStatus).toBe(kImageDimensionsStatus.ready);
      expect(dbFile.imageWidth).toBeGreaterThan(0);
      expect(dbFile.imageHeight).toBeGreaterThan(0);
    }

    await backfillImageDimensionsFromFiles({
      pageSize: 10,
      concurrency: 5,
    });

    // Seeded files stay ready (dropped out of pending query).
    for (const resourceId of seededIds) {
      const dbFile = await kIjxSemantic.file().assertGetOneByQuery({
        resourceId,
      });
      expect(dbFile.imageDimensionsStatus).toBe(kImageDimensionsStatus.ready);
    }
  });
});
