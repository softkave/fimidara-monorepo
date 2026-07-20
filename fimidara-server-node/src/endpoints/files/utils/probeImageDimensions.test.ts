import {Readable} from 'stream';
import sharp from 'sharp';
import {afterAll, beforeAll, describe, expect, test, vi} from 'vitest';
import {kIjxSemantic, kIjxUtils} from '../../../contexts/ijx/injectables.js';
import {kImageDimensionsStatus} from '../../../definitions/file.js';
import {kJobType} from '../../../definitions/job.js';
import {kGenerateTestFileType} from '../../testHelpers/generate/file/generateTestFileBinary.js';
import {completeTests} from '../../testHelpers/helpers/testFns.js';
import {
  initTests,
  insertFileForTest,
  insertUserForTest,
  insertWorkspaceForTest,
} from '../../testHelpers/utils.js';
import * as readPersistedFileModule from '../readFile/readPersistedFile.js';
import {extractPublicFile} from './extractPublicFile.js';
import {computeAspectRatio, withPublicFileAspectRatio} from './fileFields.js';
import {
  displaySizeFromMetadata,
  probeAndPersistImageDimensions,
} from './probeImageDimensions.js';

beforeAll(async () => {
  await initTests();
});

afterAll(async () => {
  await completeTests();
});

describe('displaySizeFromMetadata', () => {
  test('returns width/height when orientation does not swap axes', () => {
    expect(
      displaySizeFromMetadata({width: 100, height: 50, orientation: 1})
    ).toEqual({width: 100, height: 50});
    expect(
      displaySizeFromMetadata({width: 100, height: 50, orientation: 3})
    ).toEqual({width: 100, height: 50});
  });

  test('swaps width/height for EXIF orientations 5–8', () => {
    expect(
      displaySizeFromMetadata({width: 100, height: 50, orientation: 5})
    ).toEqual({width: 50, height: 100});
    expect(
      displaySizeFromMetadata({width: 100, height: 50, orientation: 8})
    ).toEqual({width: 50, height: 100});
  });

  test('returns undefined when width or height missing', () => {
    expect(displaySizeFromMetadata({width: 100})).toBeUndefined();
    expect(displaySizeFromMetadata({})).toBeUndefined();
  });
});

describe('computeAspectRatio / extractPublicFile', () => {
  test('computeAspectRatio returns width/height when both positive', () => {
    expect(computeAspectRatio({imageWidth: 300, imageHeight: 200})).toBe(1.5);
    expect(
      computeAspectRatio({imageWidth: 100, imageHeight: 0})
    ).toBeUndefined();
    expect(computeAspectRatio({})).toBeUndefined();
  });

  test('withPublicFileAspectRatio adds aspectRatio when dims present', () => {
    const result = withPublicFileAspectRatio({
      resourceId: 'id',
      workspaceId: 'ws',
      name: 'a.png',
      size: 1,
      version: 1,
      createdAt: 1,
      lastUpdatedAt: 1,
      isDeleted: false,
      idPath: ['id'],
      namepath: ['a'],
      parentId: null,
      imageWidth: 400,
      imageHeight: 200,
      imageDimensionsStatus: kImageDimensionsStatus.ready,
      read: {available: true, availableForYou: true},
      write: {available: true, availableForYou: true},
    } as Parameters<typeof withPublicFileAspectRatio>[0]);

    expect(result.aspectRatio).toBe(2);
  });
});

describe('probeAndPersistImageDimensions', () => {
  test('probes JPEG with EXIF orientation for display dims', async () => {
    const {userToken} = await insertUserForTest();
    const {workspace} = await insertWorkspaceForTest(userToken);

    // 100x50 pixels with orientation 6 (90° CW) → display 50x100
    const jpegBuffer = await sharp({
      create: {
        width: 100,
        height: 50,
        channels: 3,
        background: {r: 0, g: 128, b: 255},
      },
    })
      .jpeg()
      .withMetadata({orientation: 6})
      .toBuffer();

    const {rawFile} = await insertFileForTest(
      userToken,
      workspace,
      {
        data: Readable.from(jpegBuffer),
        size: jpegBuffer.byteLength,
        mimetype: 'image/jpeg',
      },
      kGenerateTestFileType.png
    );

    await kIjxSemantic.utils().withTxn(async opts => {
      await kIjxSemantic.file().getAndUpdateOneById(
        rawFile.resourceId,
        {
          imageWidth: null,
          imageHeight: null,
          imageDimensionsStatus: kImageDimensionsStatus.pending,
          mimetype: 'image/jpeg',
          ext: 'jpg',
        },
        opts
      );
    });

    const {file, updated} = await probeAndPersistImageDimensions(
      rawFile.resourceId
    );

    expect(updated).toBe(true);
    expect(file.imageDimensionsStatus).toBe(kImageDimensionsStatus.ready);
    expect(file.imageWidth).toBe(50);
    expect(file.imageHeight).toBe(100);
  });

  test('marks non-image as unsupported', async () => {
    const {userToken} = await insertUserForTest();
    const {workspace} = await insertWorkspaceForTest(userToken);
    const text = Buffer.from('not an image');
    const {rawFile} = await insertFileForTest(
      userToken,
      workspace,
      {
        data: Readable.from(text),
        size: text.byteLength,
        mimetype: 'text/plain',
      },
      kGenerateTestFileType.txt
    );

    await kIjxSemantic.utils().withTxn(async opts => {
      await kIjxSemantic.file().getAndUpdateOneById(
        rawFile.resourceId,
        {
          imageWidth: null,
          imageHeight: null,
          imageDimensionsStatus: kImageDimensionsStatus.pending,
          mimetype: 'text/plain',
          ext: 'txt',
        },
        opts
      );
    });

    const {file} = await probeAndPersistImageDimensions(rawFile.resourceId);
    expect(file.imageDimensionsStatus).toBe(
      kImageDimensionsStatus.unsupported
    );
    expect(file.imageWidth).toBeNull();
    expect(file.imageHeight).toBeNull();
  });

  test('skips persist when file version changed mid-probe', async () => {
    const {userToken} = await insertUserForTest();
    const {workspace} = await insertWorkspaceForTest(userToken);
    const {rawFile} = await insertFileForTest(
      userToken,
      workspace,
      {},
      kGenerateTestFileType.png,
      {width: 120, height: 80}
    );

    await kIjxUtils.promises().flush();

    await kIjxSemantic.utils().withTxn(async opts => {
      await kIjxSemantic.file().getAndUpdateOneById(
        rawFile.resourceId,
        {
          imageWidth: null,
          imageHeight: null,
          imageDimensionsStatus: kImageDimensionsStatus.pending,
        },
        opts
      );
    });

    const before = await kIjxSemantic.file().assertGetOneByQuery({
      resourceId: rawFile.resourceId,
    });

    const original = readPersistedFileModule.readPersistedFile;
    const spy = vi
      .spyOn(readPersistedFileModule, 'readPersistedFile')
      .mockImplementation(async (file, ranges) => {
        await kIjxSemantic.utils().withTxn(async opts => {
          await kIjxSemantic.file().getAndUpdateOneById(
            file.resourceId,
            {
              version: before.version + 1,
              imageWidth: null,
              imageHeight: null,
              imageDimensionsStatus: kImageDimensionsStatus.pending,
            },
            opts
          );
        });
        return original(file, ranges);
      });

    try {
      const result = await probeAndPersistImageDimensions(rawFile.resourceId);
      const after = await kIjxSemantic.file().assertGetOneByQuery({
        resourceId: rawFile.resourceId,
      });

      expect(after.version).toBe(before.version + 1);
      expect(after.imageDimensionsStatus).toBe(
        kImageDimensionsStatus.pending
      );
      expect(result.updated).toBe(false);
    } finally {
      spy.mockRestore();
    }
  });

  test('upload queues probeImageDimensions job for images', async () => {
    const {userToken} = await insertUserForTest();
    const {workspace} = await insertWorkspaceForTest(userToken);
    const {rawFile, file} = await insertFileForTest(
      userToken,
      workspace,
      {},
      kGenerateTestFileType.png,
      {width: 64, height: 32}
    );

    await kIjxUtils.promises().flush();

    expect(file.imageDimensionsStatus).toBe(kImageDimensionsStatus.pending);

    const job = await kIjxSemantic.job().getOneByQuery({
      type: kJobType.probeImageDimensions,
      params: {$objMatch: {fileId: rawFile.resourceId}},
    });
    expect(job).toBeTruthy();

    const {file: probed} = await probeAndPersistImageDimensions(
      rawFile.resourceId
    );
    expect(probed.imageDimensionsStatus).toBe(kImageDimensionsStatus.ready);
    expect(probed.imageWidth).toBe(64);
    expect(probed.imageHeight).toBe(32);

    const publicFile = extractPublicFile(probed, 'agent');
    expect(publicFile.aspectRatio).toBe(2);
  });
});
