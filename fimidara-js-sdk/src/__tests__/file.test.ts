import {invokeEndpoint} from 'mfdoc-js-sdk-base';
import {describe, expect, test} from 'vitest';
import {getFimidaraReadFileURL} from '../path/index.js';
import {getTestFilepath} from '../testutils/execFns/file.js';
import {
  fimidaraTestInstance,
  fimidaraTestVars,
  test_deleteFile,
  test_getFileDetails,
  test_readFile_multipleRanges,
  test_readFile_nodeReadable,
  test_readFile_rangeHeader,
  test_readFile_rangeNotSatisfiable,
  test_readFile_singleRange,
  test_updateFileDetails,
  test_uploadFile_appendCreateIfNotExists,
  test_uploadFile_appendFileNotExistsShouldFail,
  test_uploadFile_appendToExisting,
  test_uploadFile_appendWithMultipartShouldFail,
  test_uploadFile_multipleAppends,
  test_uploadFile_nodeReadable,
  test_uploadFile_nodeReadableNotFromFile,
  test_uploadFile_string,
} from '../testutils/tests/file.js';
import {
  getTestFileByteLength,
  getTestFileReadStream,
} from '../testutils/utils.node.js';

// TODO: test upload file with browser readable, buffer, and integer arrays

describe('file', () => {
  test('upload file with node.js readable', async () => {
    await test_uploadFile_nodeReadable();
  });

  test('upload file with string', async () => {
    await test_uploadFile_string();
  });

  test('upload file with node readable not from file', async () => {
    await test_uploadFile_nodeReadableNotFromFile();
  });

  test('read file with readable', async () => {
    await test_readFile_nodeReadable();
  });

  test('download file URL', async () => {
    const uploadedFile = await getTestFilepath(
      fimidaraTestInstance,
      fimidaraTestVars,
      /** file matcher, empty object will generate filepath internally */ {},
      /** upload file props */ {
        data: getTestFileReadStream(fimidaraTestVars),
        size: await getTestFileByteLength(fimidaraTestVars),
      }
    );
    const presignedPath =
      await fimidaraTestInstance.presignedPaths.issuePresignedPath({
        filepath: uploadedFile.filepath,
      });
    const presignedPathURL = getFimidaraReadFileURL({
      serverURL: fimidaraTestVars.serverURL,
      filepath: presignedPath.path,
      download: true,
    });
    const getFilepathURL = getFimidaraReadFileURL({
      serverURL: fimidaraTestVars.serverURL,
      filepath: uploadedFile.filepath,
      download: true,
    });

    expect(presignedPathURL).toBe(
      `${fimidaraTestVars.serverURL}/v1/files/readFile/${presignedPath.path}?download=true`
    );

    const readFileUsingPresignedPathResult = await invokeEndpoint({
      endpointURL: presignedPathURL,
      method: 'GET',
      responseType: 'blob',
    });

    expect(
      readFileUsingPresignedPathResult.headers['content-disposition']
    ).toContain(`attachment;`);

    const readFileUsingFilepathResult = await invokeEndpoint({
      endpointURL: getFilepathURL,
      bearerToken: fimidaraTestVars.authToken,
      method: 'POST',
      responseType: 'blob',
    });

    expect(
      readFileUsingFilepathResult.headers['content-disposition']
    ).toContain('attachment');
  });

  test('update file details', async () => {
    await test_updateFileDetails();
  });

  test('get file details', async () => {
    await test_getFileDetails();
  });

  test('delete file', async () => {
    await test_deleteFile();
  });

  test('listParts', async () => {
    const {file} = await test_uploadFile_nodeReadable();
    const result = await fimidaraTestInstance.files.listParts({
      fileId: file.resourceId,
    });

    expect(result.clientMultipartId).toBeFalsy();
    expect(result.parts).toHaveLength(0);
    expect(result.page).toBe(1);

    // TODO: add test for when multipart is in progress
  });

  test('start multipart upload', async () => {
    const {file} = await test_uploadFile_nodeReadable();
    await fimidaraTestInstance.files.startMultipartUpload({
      fileId: file.resourceId,
      clientMultipartId: 'test',
    });

    // should throw error if a different multipart upload is already in progress
    await expect(
      fimidaraTestInstance.files.startMultipartUpload({
        fileId: file.resourceId,
        clientMultipartId: 'test test',
      })
    ).rejects.toThrow();

    // should not throw error if the same multipart upload is already in
    // progress
    await fimidaraTestInstance.files.startMultipartUpload({
      fileId: file.resourceId,
      clientMultipartId: 'test',
    });
  });

  test('delete multipart upload part', async () => {
    const {file} = await test_uploadFile_nodeReadable();
    await fimidaraTestInstance.files.startMultipartUpload({
      fileId: file.resourceId,
      clientMultipartId: 'test',
    });

    const buf = Buffer.from('test');
    await fimidaraTestInstance.files.uploadFile({
      fileId: file.resourceId,
      clientMultipartId: 'test',
      part: 1,
      data: buf,
      size: buf.length,
    });

    let uploadedParts = await fimidaraTestInstance.files.listParts({
      fileId: file.resourceId,
    });

    expect(uploadedParts.clientMultipartId).toBe('test');
    expect(uploadedParts.parts).toHaveLength(1);
    expect(uploadedParts.parts[0].part).toBe(1);
    expect(uploadedParts.parts[0].size).toBe(buf.length);

    await fimidaraTestInstance.files.deleteFile({
      fileId: file.resourceId,
      clientMultipartId: 'test',
      part: 1,
    });

    uploadedParts = await fimidaraTestInstance.files.listParts({
      fileId: file.resourceId,
    });

    expect(uploadedParts.parts).toHaveLength(0);
  });

  test('delete multipart upload', async () => {
    const {file} = await test_uploadFile_nodeReadable();
    await fimidaraTestInstance.files.startMultipartUpload({
      fileId: file.resourceId,
      clientMultipartId: 'test',
    });

    const buf = Buffer.from('test');
    await fimidaraTestInstance.files.uploadFile({
      fileId: file.resourceId,
      clientMultipartId: 'test',
      part: 1,
      data: buf,
      size: buf.length,
    });

    let uploadedParts = await fimidaraTestInstance.files.listParts({
      fileId: file.resourceId,
    });

    expect(uploadedParts.clientMultipartId).toBe('test');
    expect(uploadedParts.parts).toHaveLength(1);
    expect(uploadedParts.parts[0].part).toBe(1);
    expect(uploadedParts.parts[0].size).toBe(buf.length);

    await fimidaraTestInstance.files.deleteFile({
      fileId: file.resourceId,
      clientMultipartId: 'test',
    });

    uploadedParts = await fimidaraTestInstance.files.listParts({
      fileId: file.resourceId,
    });

    expect(uploadedParts.parts).toHaveLength(0);

    // should not throw because the multipart upload is already deleted
    await fimidaraTestInstance.files.startMultipartUpload({
      fileId: file.resourceId,
      clientMultipartId: 'test test',
    });
  });

  test('complete multipart upload', async () => {
    const {file} = await test_uploadFile_nodeReadable();
    await fimidaraTestInstance.files.startMultipartUpload({
      fileId: file.resourceId,
      clientMultipartId: 'test',
    });

    const buf = Buffer.from('test');
    await fimidaraTestInstance.files.uploadFile({
      fileId: file.resourceId,
      clientMultipartId: 'test',
      part: 1,
      data: buf,
      size: buf.length,
    });

    const result = await fimidaraTestInstance.files.completeMultipartUpload({
      fileId: file.resourceId,
      clientMultipartId: 'test',
      parts: [{part: 1}],
    });

    expect(result.file.resourceId).toBe(file.resourceId);
    expect(result.jobId).toBeDefined();
  });

  describe('range downloads', () => {
    test('read file with single range at beginning', async () => {
      const fileContent = '0123456789ABCDEFGHIJ';
      await test_readFile_singleRange({start: 0, end: 4}, fileContent);
    });

    test('read file with single range in middle', async () => {
      const fileContent = '0123456789ABCDEFGHIJ';
      await test_readFile_singleRange({start: 5, end: 9}, fileContent);
    });

    test('read file with single range at end', async () => {
      const fileContent = '0123456789ABCDEFGHIJ';
      const fileLength = fileContent.length;
      await test_readFile_singleRange(
        {start: fileLength - 5, end: fileLength - 1},
        fileContent
      );
    });

    test('read file with single range covering full file', async () => {
      const fileContent = '0123456789ABCDEFGHIJ';
      const fileLength = fileContent.length;
      await test_readFile_singleRange(
        {start: 0, end: fileLength - 1},
        fileContent
      );
    });

    test('read file with multiple ranges (multipart)', async () => {
      const fileContent = '0123456789ABCDEFGHIJ';
      await test_readFile_multipleRanges(
        [
          {start: 0, end: 4},
          {start: 10, end: 14},
        ],
        fileContent
      );
    });

    test('read file with multiple ranges overlapping', async () => {
      const fileContent = '0123456789ABCDEFGHIJ';
      await test_readFile_multipleRanges(
        [
          {start: 0, end: 9},
          {start: 5, end: 14},
        ],
        fileContent
      );
    });

    test('read file with range header', async () => {
      const fileContent = '0123456789ABCDEFGHIJ';
      await test_readFile_rangeHeader('bytes=5-9', fileContent);
    });

    test('read file with range header multiple ranges', async () => {
      const fileContent = '0123456789ABCDEFGHIJ';
      await test_readFile_rangeHeader('bytes=0-4,10-14', fileContent);
    });

    test('read file with range not satisfiable - start beyond file size', async () => {
      const fileContent = '0123456789ABCDEFGHIJ';
      const fileLength = fileContent.length;
      // Request range that starts beyond the file size
      await test_readFile_rangeNotSatisfiable(
        {start: fileLength + 10, end: fileLength + 20},
        fileContent
      );
    });
  });

  describe('append mode', () => {
    test('append to existing file', async () => {
      await test_uploadFile_appendToExisting();
    });

    test('append when file does not exist with onAppendCreateIfNotExists=true', async () => {
      await test_uploadFile_appendCreateIfNotExists(true);
    });

    test('append when file does not exist with onAppendCreateIfNotExists=false should fail', async () => {
      await test_uploadFile_appendFileNotExistsShouldFail(false);
    });

    test('append when file does not exist without onAppendCreateIfNotExists should fail', async () => {
      await test_uploadFile_appendFileNotExistsShouldFail();
    });

    test('multiple append operations', async () => {
      await test_uploadFile_multipleAppends();
    });

    test('append cannot be used with multipart uploads', async () => {
      await test_uploadFile_appendWithMultipartShouldFail();
    });
  });
});
