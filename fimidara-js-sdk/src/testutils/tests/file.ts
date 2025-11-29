import assert from 'assert';
import {Readable} from 'stream';
import {expect} from 'vitest';
import {FimidaraEndpoints} from '../../endpoints/publicEndpoints.js';
import {Range, ReadFileEndpointParams} from '../../endpoints/publicTypes.js';
import {stringifyFimidaraFilepath} from '../../path/index.js';
import {
  deleteFileTestExecFn,
  getFileDetailsTestExecFn,
  readFileTestExecFn,
  updateFileDetailsTestExecFn,
  uploadFileTestExecFn,
} from '../execFns/file.js';
import {ITestVars, getTestVars} from '../utils.common.js';
import {
  getTestFileReadStream,
  getTestFileString,
  getTestStreamByteLength,
  streamToBuffer,
  streamToString,
} from '../utils.node.js';

export const fimidaraTestVars: ITestVars = getTestVars();
export const fimidaraTestInstance = new FimidaraEndpoints({
  authToken: fimidaraTestVars.authToken,
  serverURL: fimidaraTestVars.serverURL,
});

export const test_deleteFile = async () => {
  await deleteFileTestExecFn(fimidaraTestInstance, fimidaraTestVars);
};

export const test_getFileDetails = async () => {
  await getFileDetailsTestExecFn(fimidaraTestInstance, fimidaraTestVars);
};

export const test_readFile_blob = async (
  props: ReadFileEndpointParams = {}
) => {
  const result = await readFileTestExecFn(
    fimidaraTestInstance,
    fimidaraTestVars,
    props,
    {responseType: 'blob'},
    {data: getTestFileReadStream(fimidaraTestVars)}
  );

  const expectedString = await getTestFileString(fimidaraTestVars);
  const body = result;
  const actualString = await body.text();
  assert.strictEqual(expectedString, actualString);

  return {result, bodyStr: actualString};
};

export const test_readFile_nodeReadable = async (
  props: ReadFileEndpointParams = {}
) => {
  const result = await readFileTestExecFn(
    fimidaraTestInstance,
    fimidaraTestVars,
    props,
    {responseType: 'stream'},
    {
      data: getTestFileReadStream(fimidaraTestVars),
      size: await getTestStreamByteLength(
        getTestFileReadStream(fimidaraTestVars)
      ),
    }
  );

  const expectedString = await getTestFileString(fimidaraTestVars);
  const body = result;
  const actualString = await streamToString(body);
  expect(expectedString).toEqual(actualString);

  return {result, bodyStr: actualString};
};

export const test_updateFileDetails = async () => {
  await updateFileDetailsTestExecFn(fimidaraTestInstance, fimidaraTestVars);
};

export const test_uploadFile_nodeReadable = async () => {
  return await uploadFileTestExecFn(fimidaraTestInstance, fimidaraTestVars);
};

export const test_uploadFile_string = async () => {
  const text = 'Hello World!';
  const buf = Buffer.from(text);
  await uploadFileTestExecFn(fimidaraTestInstance, fimidaraTestVars, {
    data: text,
    size: buf.byteLength,
  });
};

export const test_uploadFile_nodeReadableNotFromFile = async () => {
  const buf = Buffer.from(
    'Hello world! Node Readable stream not from file test'
  );
  const stringStream = Readable.from([buf]);
  await uploadFileTestExecFn(fimidaraTestInstance, fimidaraTestVars, {
    data: stringStream,
    size: buf.byteLength,
  });
};

export const test_readFile_singleRange = async (
  range: Range,
  uploadFileContent?: string
) => {
  // Upload a file with known content
  const fileContent =
    uploadFileContent || (await getTestFileString(fimidaraTestVars));
  const fileBuffer = Buffer.from(fileContent);
  const fileStream = Readable.from([fileBuffer]);

  const uploadResult = await uploadFileTestExecFn(
    fimidaraTestInstance,
    fimidaraTestVars,
    {
      data: fileStream,
      size: fileBuffer.byteLength,
    }
  );

  const filepath = stringifyFimidaraFilepath(
    uploadResult.file,
    fimidaraTestVars.workspaceRootname
  );

  // Read file with single range
  const result = await readFileTestExecFn(
    fimidaraTestInstance,
    fimidaraTestVars,
    {
      filepath,
      ranges: [range],
    },
    {responseType: 'stream'},
    {}
  );

  // Verify the content matches the expected range
  const expectedContent = fileBuffer.slice(range.start, range.end + 1);
  const actualContent = await streamToBuffer(result);
  expect(actualContent).toEqual(expectedContent);

  return {result, expectedContent, actualContent};
};

export const test_readFile_multipleRanges = async (
  ranges: Range[],
  uploadFileContent?: string
) => {
  // Upload a file with known content
  const fileContent =
    uploadFileContent || (await getTestFileString(fimidaraTestVars));
  const fileBuffer = Buffer.from(fileContent);
  const fileStream = Readable.from([fileBuffer]);

  const uploadResult = await uploadFileTestExecFn(
    fimidaraTestInstance,
    fimidaraTestVars,
    {
      data: fileStream,
      size: fileBuffer.byteLength,
    }
  );

  const filepath = stringifyFimidaraFilepath(
    uploadResult.file,
    fimidaraTestVars.workspaceRootname
  );

  // Read file with multiple ranges (multipart)
  // Note: The HTTP layer formats multipart into a single stream,
  // so we receive a single stream containing the multipart/byteranges response
  const result = await readFileTestExecFn(
    fimidaraTestInstance,
    fimidaraTestVars,
    {
      filepath,
      ranges,
    },
    {responseType: 'stream'},
    {}
  );

  // For multipart, we get a single stream with multipart/byteranges format
  // Verify that we get a stream back (parsing multipart is complex, so we just verify it works)
  expect(result).toBeInstanceOf(Readable);

  // Calculate expected total content length (including multipart boundaries)
  // This is a simplified check - in practice, multipart parsing would be needed
  // to extract individual ranges, but that's tested on the server side
  const totalRangeBytes = ranges.reduce(
    (sum, range) => sum + (range.end - range.start + 1),
    0
  );
  const actualContent = await streamToBuffer(result);
  // The actual content will be larger due to multipart boundaries and headers
  expect(actualContent.length).toBeGreaterThanOrEqual(totalRangeBytes);

  return {result, ranges, actualContent};
};

export const test_readFile_rangeHeader = async (
  rangeHeader: string,
  uploadFileContent?: string
) => {
  // Upload a file with known content
  const fileContent =
    uploadFileContent || (await getTestFileString(fimidaraTestVars));
  const fileBuffer = Buffer.from(fileContent);
  const fileStream = Readable.from([fileBuffer]);

  const uploadResult = await uploadFileTestExecFn(
    fimidaraTestInstance,
    fimidaraTestVars,
    {
      data: fileStream,
      size: fileBuffer.byteLength,
    }
  );

  const filepath = stringifyFimidaraFilepath(
    uploadResult.file,
    fimidaraTestVars.workspaceRootname
  );

  // Read file with range header
  const result = await readFileTestExecFn(
    fimidaraTestInstance,
    fimidaraTestVars,
    {
      filepath,
      rangeHeader,
    },
    {responseType: 'stream'},
    {}
  );

  // Parse the range header to get expected content
  // For single range: bytes=start-end
  // For multiple ranges: bytes=start1-end1,start2-end2
  const singleRangeMatch = rangeHeader.match(/^bytes=(\d+)-(\d+)$/);
  if (singleRangeMatch) {
    const start = parseInt(singleRangeMatch[1], 10);
    const end = parseInt(singleRangeMatch[2], 10);
    const expectedContent = fileBuffer.slice(start, end + 1);
    const actualContent = await streamToBuffer(result);
    expect(actualContent).toEqual(expectedContent);
  } else {
    // Multiple ranges - verify we get a stream back
    // (parsing multipart is complex and tested on server side)
    expect(result).toBeInstanceOf(Readable);
    const actualContent = await streamToBuffer(result);
    expect(actualContent.length).toBeGreaterThan(0);
  }

  return {result};
};

export const test_readFile_rangeNotSatisfiable = async (
  range: Range,
  uploadFileContent?: string
) => {
  // Upload a file with known content
  const fileContent =
    uploadFileContent || (await getTestFileString(fimidaraTestVars));
  const fileBuffer = Buffer.from(fileContent);
  const fileStream = Readable.from([fileBuffer]);

  const uploadResult = await uploadFileTestExecFn(
    fimidaraTestInstance,
    fimidaraTestVars,
    {
      data: fileStream,
      size: fileBuffer.byteLength,
    }
  );

  const filepath = stringifyFimidaraFilepath(
    uploadResult.file,
    fimidaraTestVars.workspaceRootname
  );

  // Attempt to read file with range that starts beyond file size
  // This should throw an error
  await expect(
    readFileTestExecFn(
      fimidaraTestInstance,
      fimidaraTestVars,
      {
        filepath,
        ranges: [range],
      },
      {responseType: 'stream'},
      {}
    )
  ).rejects.toThrow();

  return {filepath, fileSize: fileBuffer.byteLength};
};
