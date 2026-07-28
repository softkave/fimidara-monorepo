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
  fileNeedsImageDimensionsProbe,
  probeAndPersistImageDimensions,
} from './probeImageDimensions.js';
import {stringifyFilenamepath} from '../utils.js';

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

describe('fileNeedsImageDimensionsProbe', () => {
  test('returns false for non-images', () => {
    expect(
      fileNeedsImageDimensionsProbe({
        mimetype: 'text/plain',
        ext: 'txt',
      })
    ).toBe(false);
  });

  test('returns false when ready with dims', () => {
    expect(
      fileNeedsImageDimensionsProbe({
        mimetype: 'image/png',
        ext: 'png',
        imageWidth: 10,
        imageHeight: 10,
        imageDimensionsStatus: kImageDimensionsStatus.ready,
      })
    ).toBe(false);
  });

  test('returns false for unsupported and failed', () => {
    expect(
      fileNeedsImageDimensionsProbe({
        mimetype: 'image/png',
        ext: 'png',
        imageDimensionsStatus: kImageDimensionsStatus.unsupported,
      })
    ).toBe(false);
    expect(
      fileNeedsImageDimensionsProbe({
        mimetype: 'image/png',
        ext: 'png',
        imageDimensionsStatus: kImageDimensionsStatus.failed,
      })
    ).toBe(false);
  });

  test('returns true for pending or missing status', () => {
    expect(
      fileNeedsImageDimensionsProbe({
        mimetype: 'image/png',
        ext: 'png',
        imageDimensionsStatus: kImageDimensionsStatus.pending,
      })
    ).toBe(true);
    expect(
      fileNeedsImageDimensionsProbe({
        mimetype: 'image/jpeg',
        ext: 'jpg',
      })
    ).toBe(true);
  });

  test('returns true when dims missing with non-terminal status', () => {
    expect(
      fileNeedsImageDimensionsProbe({
        mimetype: 'image/png',
        ext: 'png',
        imageDimensionsStatus: kImageDimensionsStatus.ready,
        imageWidth: null,
        imageHeight: null,
      })
    ).toBe(true);
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

  test('marks corrupt image-like bytes as failed', async () => {
    const {userToken} = await insertUserForTest();
    const {workspace} = await insertWorkspaceForTest(userToken);
    const corrupt = Buffer.from('not-a-real-png-but-looks-like-one');
    const {rawFile} = await insertFileForTest(
      userToken,
      workspace,
      {
        data: Readable.from(corrupt),
        size: corrupt.byteLength,
        mimetype: 'image/png',
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
          mimetype: 'image/png',
          ext: 'png',
        },
        opts
      );
    });

    const {file, updated} = await probeAndPersistImageDimensions(
      rawFile.resourceId
    );
    expect(updated).toBe(true);
    expect(file.imageDimensionsStatus).toBe(kImageDimensionsStatus.failed);
    expect(file.imageWidth).toBeNull();
    expect(file.imageHeight).toBeNull();
  });

  test('early-exits when already ready or terminal', async () => {
    const {userToken} = await insertUserForTest();
    const {workspace} = await insertWorkspaceForTest(userToken);
    const {rawFile} = await insertFileForTest(
      userToken,
      workspace,
      {},
      kGenerateTestFileType.png,
      {width: 40, height: 20}
    );

    await kIjxUtils.promises().flush();
    await probeAndPersistImageDimensions(rawFile.resourceId);

    const readyAgain = await probeAndPersistImageDimensions(rawFile.resourceId);
    expect(readyAgain.updated).toBe(false);
    expect(readyAgain.file.imageDimensionsStatus).toBe(
      kImageDimensionsStatus.ready
    );

    await kIjxSemantic.utils().withTxn(async opts => {
      await kIjxSemantic.file().getAndUpdateOneById(
        rawFile.resourceId,
        {
          imageWidth: null,
          imageHeight: null,
          imageDimensionsStatus: kImageDimensionsStatus.failed,
        },
        opts
      );
    });

    const failedAgain = await probeAndPersistImageDimensions(
      rawFile.resourceId
    );
    expect(failedAgain.updated).toBe(false);
    expect(failedAgain.file.imageDimensionsStatus).toBe(
      kImageDimensionsStatus.failed
    );

    await kIjxSemantic.utils().withTxn(async opts => {
      await kIjxSemantic.file().getAndUpdateOneById(
        rawFile.resourceId,
        {
          imageDimensionsStatus: kImageDimensionsStatus.unsupported,
        },
        opts
      );
    });

    const unsupportedAgain = await probeAndPersistImageDimensions(
      rawFile.resourceId
    );
    expect(unsupportedAgain.updated).toBe(false);
    expect(unsupportedAgain.file.imageDimensionsStatus).toBe(
      kImageDimensionsStatus.unsupported
    );
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

  test('overwrite clears ready dims back to pending', async () => {
    const {userToken} = await insertUserForTest();
    const {workspace} = await insertWorkspaceForTest(userToken);
    const {rawFile, file} = await insertFileForTest(
      userToken,
      workspace,
      {},
      kGenerateTestFileType.png,
      {width: 80, height: 40}
    );

    await kIjxUtils.promises().flush();
    await probeAndPersistImageDimensions(rawFile.resourceId);

    const ready = await kIjxSemantic.file().assertGetOneByQuery({
      resourceId: rawFile.resourceId,
    });
    expect(ready.imageDimensionsStatus).toBe(kImageDimensionsStatus.ready);
    expect(ready.imageWidth).toBe(80);

    const replacement = await sharp({
      create: {
        width: 60,
        height: 30,
        channels: 3,
        background: {r: 1, g: 2, b: 3},
      },
    })
      .png()
      .toBuffer();

    await insertFileForTest(
      userToken,
      workspace,
      {
        filepath: stringifyFilenamepath(file, workspace.rootname),
        data: Readable.from(replacement),
        size: replacement.byteLength,
        mimetype: 'image/png',
      },
      kGenerateTestFileType.png
    );

    const afterReplace = await kIjxSemantic.file().assertGetOneByQuery({
      resourceId: rawFile.resourceId,
    });
    expect(afterReplace.imageDimensionsStatus).toBe(
      kImageDimensionsStatus.pending
    );
    expect(afterReplace.imageWidth).toBeNull();
    expect(afterReplace.imageHeight).toBeNull();
  });
});
