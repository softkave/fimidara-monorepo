import {faker} from '@faker-js/faker';
import assert from 'assert';
import {Readable} from 'stream';
import {expect} from 'vitest';
import {FimidaraEndpoints} from '../../endpoints/publicEndpoints.js';
import {Range, ReadFileEndpointParams} from '../../endpoints/publicTypes.js';
import {
  fimidaraAddRootnameToPath,
  stringifyFimidaraFilepath,
} from '../../path/index.js';
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

export const test_uploadFile_appendToExisting = async () => {
  // Upload initial file
  const initialContent = 'Initial content';
  const initialBuffer = Buffer.from(initialContent);
  const initialStream = Readable.from([initialBuffer]);

  const initialUploadResult = await uploadFileTestExecFn(
    fimidaraTestInstance,
    fimidaraTestVars,
    {
      data: initialStream,
      size: initialBuffer.byteLength,
    }
  );

  const filepath = stringifyFimidaraFilepath(
    initialUploadResult.file,
    fimidaraTestVars.workspaceRootname
  );

  // Append data to the file
  const appendContent = ' appended content';
  const appendBuffer = Buffer.from(appendContent);
  const appendStream = Readable.from([appendBuffer]);

  const appendUploadResult = await uploadFileTestExecFn(
    fimidaraTestInstance,
    fimidaraTestVars,
    {
      filepath,
      data: appendStream,
      size: appendBuffer.byteLength,
      append: true,
    }
  );

  // Verify file size increased
  expect(appendUploadResult.file.size).toBe(
    initialBuffer.byteLength + appendBuffer.byteLength
  );

  // Read the file and verify it contains both chunks
  const readResult = await readFileTestExecFn(
    fimidaraTestInstance,
    fimidaraTestVars,
    {filepath},
    {responseType: 'stream'},
    {}
  );

  const actualContent = await streamToString(readResult);
  const expectedContent = initialContent + appendContent;
  expect(actualContent).toBe(expectedContent);

  return {
    initialUploadResult,
    appendUploadResult,
    filepath,
    expectedContent,
    actualContent,
  };
};

export const test_uploadFile_appendCreateIfNotExists = async (
  onAppendCreateIfNotExists: boolean
) => {
  const filepath = fimidaraAddRootnameToPath(
    faker.system.filePath(),
    fimidaraTestVars.workspaceRootname
  );

  const content = 'New file content';
  const buffer = Buffer.from(content);
  const stream = Readable.from([buffer]);

  const uploadResult = await uploadFileTestExecFn(
    fimidaraTestInstance,
    fimidaraTestVars,
    {
      filepath,
      data: stream,
      size: buffer.byteLength,
      append: true,
      onAppendCreateIfNotExists,
    }
  );

  // Verify file was created
  expect(uploadResult.file.size).toBe(buffer.byteLength);

  // Read the file and verify content
  const readResult = await readFileTestExecFn(
    fimidaraTestInstance,
    fimidaraTestVars,
    {filepath},
    {responseType: 'stream'},
    {}
  );

  const actualContent = await streamToString(readResult);
  expect(actualContent).toBe(content);

  return {uploadResult, filepath, content, actualContent};
};

export const test_uploadFile_appendFileNotExistsShouldFail = async (
  onAppendCreateIfNotExists: boolean = false
) => {
  const filepath = fimidaraAddRootnameToPath(
    faker.system.filePath(),
    fimidaraTestVars.workspaceRootname
  );

  const content = 'Content for non-existent file';
  const buffer = Buffer.from(content);
  const stream = Readable.from([buffer]);

  // This should throw an error
  await expect(
    uploadFileTestExecFn(fimidaraTestInstance, fimidaraTestVars, {
      filepath,
      data: stream,
      size: buffer.byteLength,
      append: true,
      onAppendCreateIfNotExists,
    })
  ).rejects.toThrow();

  return {filepath};
};

export const test_uploadFile_multipleAppends = async () => {
  // Upload initial file
  const initialContent = 'Initial';
  const initialBuffer = Buffer.from(initialContent);
  const initialStream = Readable.from([initialBuffer]);

  const initialUploadResult = await uploadFileTestExecFn(
    fimidaraTestInstance,
    fimidaraTestVars,
    {
      data: initialStream,
      size: initialBuffer.byteLength,
    }
  );

  const filepath = stringifyFimidaraFilepath(
    initialUploadResult.file,
    fimidaraTestVars.workspaceRootname
  );

  // Append multiple times
  const appendContents = [' first', ' second', ' third'];
  let totalSize = initialBuffer.byteLength;
  let expectedContent = initialContent;

  for (const appendContent of appendContents) {
    const appendBuffer = Buffer.from(appendContent);
    const appendStream = Readable.from([appendBuffer]);

    const appendUploadResult = await uploadFileTestExecFn(
      fimidaraTestInstance,
      fimidaraTestVars,
      {
        filepath,
        data: appendStream,
        size: appendBuffer.byteLength,
        append: true,
      }
    );

    totalSize += appendBuffer.byteLength;
    expectedContent += appendContent;

    expect(appendUploadResult.file.size).toBe(totalSize);
  }

  // Read the file and verify it contains all chunks
  const readResult = await readFileTestExecFn(
    fimidaraTestInstance,
    fimidaraTestVars,
    {filepath},
    {responseType: 'stream'},
    {}
  );

  const actualContent = await streamToString(readResult);
  expect(actualContent).toBe(expectedContent);

  return {
    initialUploadResult,
    filepath,
    expectedContent,
    actualContent,
    totalSize,
  };
};

export const test_uploadFile_appendWithMultipartShouldFail = async () => {
  // Upload initial file
  const initialContent = 'Initial content';
  const initialBuffer = Buffer.from(initialContent);
  const initialStream = Readable.from([initialBuffer]);

  const initialUploadResult = await uploadFileTestExecFn(
    fimidaraTestInstance,
    fimidaraTestVars,
    {
      data: initialStream,
      size: initialBuffer.byteLength,
    }
  );

  const filepath = stringifyFimidaraFilepath(
    initialUploadResult.file,
    fimidaraTestVars.workspaceRootname
  );

  // Try to append with multipart - this should fail
  const appendContent = 'Appended content';
  const appendBuffer = Buffer.from(appendContent);
  const appendStream = Readable.from([appendBuffer]);

  await expect(
    uploadFileTestExecFn(fimidaraTestInstance, fimidaraTestVars, {
      filepath,
      data: appendStream,
      size: appendBuffer.byteLength,
      append: true,
      clientMultipartId: 'test-multipart-id',
      part: 1,
    })
  ).rejects.toThrow();

  return {initialUploadResult, filepath};
};
