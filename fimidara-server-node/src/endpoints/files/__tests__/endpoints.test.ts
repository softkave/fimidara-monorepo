import busboy from 'busboy';
import {Request, Response} from 'express';
import {PassThrough, Readable} from 'stream';
import {beforeEach, describe, expect, test, vi} from 'vitest';
import {FimidaraExternalError} from '../../../utils/OperationError.js';
import {kEndpointTag} from '../../types.js';
import {kFileConstants} from '../constants.js';
import {getFilesHttpEndpoints} from '../endpoints.js';
import {RangeNotSatisfiableError} from '../errors.js';
import {
  ReadFileEndpointParams,
  ReadFileEndpointResult,
} from '../readFile/types.js';
import {UploadFileEndpointParams} from '../uploadFile/types.js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Module is mocked, type resolution fails but works at runtime
import * as mountUtilsModule from '../../fileBackends/mountUtils.js';

// Access internal functions through the module for testing
// Since they're not exported, we'll test them through the endpoint configuration

// Mock dependencies
vi.mock('busboy');
vi.mock('../../../../contexts/ijx/injectables.js', () => ({
  kIjxUtils: {
    logger: () => ({
      error: vi.fn(),
    }),
  },
}));
vi.mock('../../fileBackends/mountUtils.js', () => ({
  populateMountUnsupportedOpNoteInNotFoundError: vi.fn(),
}));

// Mock stream/promises
vi.mock('stream/promises', () => ({
  finished: vi.fn().mockResolvedValue(undefined),
}));

describe('endpoints', () => {
  describe('getFilesHttpEndpoints', () => {
    test('returns all file endpoints with correct structure', () => {
      const endpoints = getFilesHttpEndpoints();

      expect(endpoints).toHaveProperty('deleteFile');
      expect(endpoints).toHaveProperty('getFileDetails');
      expect(endpoints).toHaveProperty('listParts');
      expect(endpoints).toHaveProperty('readFile');
      expect(endpoints).toHaveProperty('updateFileDetails');
      expect(endpoints).toHaveProperty('uploadFile');
      expect(endpoints).toHaveProperty('startMultipartUpload');
      expect(endpoints).toHaveProperty('completeMultipartUpload');

      // Check readFile is an array with 3 endpoints (POST, GET, HEAD)
      expect(Array.isArray(endpoints.readFile)).toBe(true);
      expect(endpoints.readFile).toHaveLength(3);

      // Check all endpoints have required properties
      expect(endpoints.deleteFile.tag).toContain(kEndpointTag.public);
      expect(endpoints.getFileDetails.tag).toContain(kEndpointTag.public);
      expect(endpoints.listParts.tag).toContain(kEndpointTag.public);
      expect(endpoints.updateFileDetails.tag).toContain(kEndpointTag.public);
      expect(endpoints.uploadFile.tag).toContain(kEndpointTag.public);
      expect(endpoints.startMultipartUpload.tag).toContain(kEndpointTag.public);
      expect(endpoints.completeMultipartUpload.tag).toContain(
        kEndpointTag.public
      );

      endpoints.readFile.forEach(endpoint => {
        expect(endpoint.tag).toContain(kEndpointTag.public);
        expect(endpoint.mfdocHttpDefinition).toBeDefined();
        expect(endpoint.fn).toBeDefined();
      });
    });

    test('readFile endpoints have correct handlers', () => {
      const endpoints = getFilesHttpEndpoints();

      // POST endpoint
      expect(endpoints.readFile[0].getDataFromReq).toBeDefined();
      expect(endpoints.readFile[0].handleResponse).toBeDefined();
      expect(endpoints.readFile[0].handleError).toBeDefined();

      // GET endpoint
      expect(endpoints.readFile[1].getDataFromReq).toBeDefined();
      expect(endpoints.readFile[1].handleResponse).toBeDefined();
      expect(endpoints.readFile[1].handleError).toBeDefined();

      // HEAD endpoint
      expect(endpoints.readFile[2].getDataFromReq).toBeDefined();
      expect(endpoints.readFile[2].handleResponse).toBeDefined();
      expect(endpoints.readFile[2].handleError).toBeDefined();
    });

    test('uploadFile endpoint has cleanup handler', () => {
      const endpoints = getFilesHttpEndpoints();

      expect(endpoints.uploadFile.getDataFromReq).toBeDefined();
      expect(endpoints.uploadFile.cleanup).toBeDefined();
      expect(endpoints.uploadFile.handleError).toBeDefined();
    });
  });

  describe('extractReadFileParamsFromReq through endpoint', () => {
    test('extracts basic read file params from request', () => {
      const endpoints = getFilesHttpEndpoints();
      const getDataFromReq = endpoints.readFile[0].getDataFromReq!;

      const req = {
        path: `/api/v1/files/readFile/workspace-rootname/file.txt`,
        query: {},
        headers: {},
        body: {},
      } as unknown as Request;

      const result = getDataFromReq(req) as ReadFileEndpointParams;

      expect(result.filepath).toBe('workspace-rootname/file.txt');
      expect(result.fileId).toBeUndefined();
      expect(result.download).toBeUndefined();
      expect(result.rangeHeader).toBeUndefined();
      expect(result.ifRangeHeader).toBeUndefined();
    });

    test('extracts range header from request', () => {
      const endpoints = getFilesHttpEndpoints();
      const getDataFromReq = endpoints.readFile[0].getDataFromReq!;

      const req = {
        path: `/api/v1/files/readFile/workspace-rootname/file.txt`,
        query: {},
        headers: {
          range: 'bytes=0-499',
        },
        body: {},
      } as unknown as Request;

      const result = getDataFromReq(req) as ReadFileEndpointParams;

      expect(result.rangeHeader).toBe('bytes=0-499');
    });

    test('extracts if-range header from request', () => {
      const endpoints = getFilesHttpEndpoints();
      const getDataFromReq = endpoints.readFile[0].getDataFromReq!;

      const req = {
        path: `/api/v1/files/readFile/workspace-rootname/file.txt`,
        query: {},
        headers: {
          'if-range': '"etag-value"',
        },
        body: {},
      } as unknown as Request;

      const result = getDataFromReq(req) as ReadFileEndpointParams;

      expect(result.ifRangeHeader).toBe('"etag-value"');
    });

    test('extracts download query parameter', () => {
      const endpoints = getFilesHttpEndpoints();
      const getDataFromReq = endpoints.readFile[0].getDataFromReq!;

      const req = {
        path: `/api/v1/files/readFile/workspace-rootname/file.txt`,
        query: {
          download: 'true',
        },
        headers: {},
        body: {},
      } as unknown as Request;

      const result = getDataFromReq(req) as ReadFileEndpointParams;

      expect(result.download).toBe('true');
    });

    test('extracts image resize parameters from query', () => {
      const endpoints = getFilesHttpEndpoints();
      const getDataFromReq = endpoints.readFile[0].getDataFromReq!;

      const req = {
        path: `/api/v1/files/readFile/workspace-rootname/file.txt`,
        query: {
          w: '300',
          h: '200',
          fit: 'cover',
          pos: 'center',
          bg: '#ffffff',
          withoutEnlargement: 'true',
        },
        headers: {},
        body: {},
      } as unknown as Request;

      const result = getDataFromReq(req) as ReadFileEndpointParams;

      expect(result.imageResize?.width).toBe('300');
      expect(result.imageResize?.height).toBe('200');
      expect(result.imageResize?.fit).toBe('cover');
      expect(result.imageResize?.position).toBe('center');
      expect(result.imageResize?.background).toBe('#ffffff');
      expect(result.imageResize?.withoutEnlargement).toBe('true');
    });

    test('extracts image format from query', () => {
      const endpoints = getFilesHttpEndpoints();
      const getDataFromReq = endpoints.readFile[0].getDataFromReq!;

      const req = {
        path: `/api/v1/files/readFile/workspace-rootname/file.txt`,
        query: {
          format: 'jpeg',
        },
        headers: {},
        body: {},
      } as unknown as Request;

      const result = getDataFromReq(req) as ReadFileEndpointParams;

      expect(result.imageFormat).toBe('jpeg');
    });

    test('merges body params with extracted params', () => {
      const endpoints = getFilesHttpEndpoints();
      const getDataFromReq = endpoints.readFile[0].getDataFromReq!;

      const req = {
        path: `/api/v1/files/readFile/workspace-rootname/file.txt`,
        query: {},
        headers: {},
        body: {
          fileId: 'file123',
        },
      } as unknown as Request;

      const result = getDataFromReq(req) as ReadFileEndpointParams;

      expect(result.fileId).toBe('file123');
    });
  });

  describe('extractUploadFileParamsFromReq through endpoint', () => {
    let mockBusboy: any;
    let mockFileStream: Readable;

    beforeEach(() => {
      mockFileStream = Readable.from(['test data']);
      mockBusboy = {
        on: vi.fn(),
        destroy: vi.fn(),
      };

      vi.mocked(busboy).mockReturnValue(mockBusboy as any);
    });

    test('extracts upload file params from busboy file event', async () => {
      const endpoints = getFilesHttpEndpoints();
      const getDataFromReq = endpoints.uploadFile.getDataFromReq!;

      const req = {
        path: `/api/v1/files/uploadFile/workspace-rootname/file.txt`,
        headers: {
          'content-length': '100',
          'x-fimidara-file-mimetype': 'text/plain',
          'x-fimidara-file-encoding': 'utf-8',
          'x-fimidara-file-description': 'Test file',
        },
        pipe: vi.fn(),
      } as unknown as Request;

      let fileHandler: (filename: string, stream: Readable, info: any) => void;
      mockBusboy.on.mockImplementation((event: string, handler: any) => {
        if (event === 'file') {
          fileHandler = handler;
        }
      });

      const promise = getDataFromReq(req) as Promise<UploadFileEndpointParams>;

      // Simulate file event
      fileHandler!('test.txt', mockFileStream, {
        mimeType: 'text/plain',
        encoding: 'utf-8',
      });

      const result = await promise;

      expect(result.filepath).toBe('workspace-rootname/file.txt');
      expect(result.mimetype).toBe('text/plain');
      expect(result.encoding).toBe('utf-8');
      expect(result.description).toBe('Test file');
      expect(result.size).toBe('100');
      expect(result.data).toBe(mockFileStream);
    });

    test('extracts upload file params from busboy field event', async () => {
      const endpoints = getFilesHttpEndpoints();
      const getDataFromReq = endpoints.uploadFile.getDataFromReq!;

      const req = {
        path: `/api/v1/files/uploadFile/workspace-rootname/file.txt`,
        headers: {
          'content-length': '100',
          'x-fimidara-file-mimetype': 'text/plain',
        },
        pipe: vi.fn(),
      } as unknown as Request;

      let fieldHandler: (name: string, value: string, info: any) => void;
      mockBusboy.on.mockImplementation((event: string, handler: any) => {
        if (event === 'field') {
          fieldHandler = handler;
        }
      });

      const promise = getDataFromReq(req) as Promise<UploadFileEndpointParams>;

      // Simulate field event with correct field name
      fieldHandler!(kFileConstants.uploadedFileFieldName, 'field data', {
        mimeType: 'text/plain',
        encoding: 'utf-8',
      });

      const result = await promise;

      expect(result.filepath).toBe('workspace-rootname/file.txt');
      expect(result.mimetype).toBe('text/plain');
      expect(result.data).toBeInstanceOf(Readable);
    });

    test('extracts multipart headers', async () => {
      const endpoints = getFilesHttpEndpoints();
      const getDataFromReq = endpoints.uploadFile.getDataFromReq!;

      const req = {
        path: `/api/v1/files/uploadFile/workspace-rootname/file.txt`,
        headers: {
          'x-fimidara-multipart-id': 'multipart-123',
          'x-fimidara-multipart-part': '5',
        },
        pipe: vi.fn(),
      } as unknown as Request;

      let fileHandler: (filename: string, stream: Readable, info: any) => void;
      mockBusboy.on.mockImplementation((event: string, handler: any) => {
        if (event === 'file') {
          fileHandler = handler;
        }
      });

      const promise = getDataFromReq(req) as Promise<UploadFileEndpointParams>;

      fileHandler!('test.txt', mockFileStream, {
        mimeType: 'text/plain',
        encoding: 'utf-8',
      });

      const result = await promise;

      expect(result.clientMultipartId).toBe('multipart-123');
      expect(result.part).toBe(5);
    });

    test('extracts append header as true when set to "true"', async () => {
      const endpoints = getFilesHttpEndpoints();
      const getDataFromReq = endpoints.uploadFile.getDataFromReq!;

      const req = {
        path: `/api/v1/files/uploadFile/workspace-rootname/file.txt`,
        headers: {
          'x-fimidara-append': 'true',
        },
        pipe: vi.fn(),
      } as unknown as Request;

      let fileHandler: (filename: string, stream: Readable, info: any) => void;
      mockBusboy.on.mockImplementation((event: string, handler: any) => {
        if (event === 'file') {
          fileHandler = handler;
        }
      });

      const promise = getDataFromReq(req) as Promise<UploadFileEndpointParams>;

      fileHandler!('test.txt', mockFileStream, {
        mimeType: 'text/plain',
        encoding: 'utf-8',
      });

      const result = await promise;

      expect(result.append).toBe(true);
    });

    test('extracts append header as true when set to "1"', async () => {
      const endpoints = getFilesHttpEndpoints();
      const getDataFromReq = endpoints.uploadFile.getDataFromReq!;

      const req = {
        path: `/api/v1/files/uploadFile/workspace-rootname/file.txt`,
        headers: {
          'x-fimidara-append': '1',
        },
        pipe: vi.fn(),
      } as unknown as Request;

      let fileHandler: (filename: string, stream: Readable, info: any) => void;
      mockBusboy.on.mockImplementation((event: string, handler: any) => {
        if (event === 'file') {
          fileHandler = handler;
        }
      });

      const promise = getDataFromReq(req) as Promise<UploadFileEndpointParams>;

      fileHandler!('test.txt', mockFileStream, {
        mimeType: 'text/plain',
        encoding: 'utf-8',
      });

      const result = await promise;

      expect(result.append).toBe(true);
    });

    test('extracts append header as undefined when not set or set to other values', async () => {
      const endpoints = getFilesHttpEndpoints();
      const getDataFromReq = endpoints.uploadFile.getDataFromReq!;

      const req = {
        path: `/api/v1/files/uploadFile/workspace-rootname/file.txt`,
        headers: {
          'x-fimidara-append': 'false',
        },
        pipe: vi.fn(),
      } as unknown as Request;

      let fileHandler: (filename: string, stream: Readable, info: any) => void;
      mockBusboy.on.mockImplementation((event: string, handler: any) => {
        if (event === 'file') {
          fileHandler = handler;
        }
      });

      const promise = getDataFromReq(req) as Promise<UploadFileEndpointParams>;

      fileHandler!('test.txt', mockFileStream, {
        mimeType: 'text/plain',
        encoding: 'utf-8',
      });

      const result = await promise;

      expect(result.append).toBeUndefined();
    });

    test('extracts onAppendCreateIfNotExists header as undefined when not set (defaults to false)', async () => {
      const endpoints = getFilesHttpEndpoints();
      const getDataFromReq = endpoints.uploadFile.getDataFromReq!;

      const req = {
        path: `/api/v1/files/uploadFile/workspace-rootname/file.txt`,
        headers: {
          'x-fimidara-append': 'true',
        },
        pipe: vi.fn(),
      } as unknown as Request;

      let fileHandler: (filename: string, stream: Readable, info: any) => void;
      mockBusboy.on.mockImplementation((event: string, handler: any) => {
        if (event === 'file') {
          fileHandler = handler;
        }
      });

      const promise = getDataFromReq(req) as Promise<UploadFileEndpointParams>;

      fileHandler!('test.txt', mockFileStream, {
        mimeType: 'text/plain',
        encoding: 'utf-8',
      });

      const result = await promise;

      expect(result.onAppendCreateIfNotExists).toBeUndefined();
    });

    test('extracts onAppendCreateIfNotExists header as true when set to "true"', async () => {
      const endpoints = getFilesHttpEndpoints();
      const getDataFromReq = endpoints.uploadFile.getDataFromReq!;

      const req = {
        path: `/api/v1/files/uploadFile/workspace-rootname/file.txt`,
        headers: {
          'x-fimidara-append': 'true',
          'x-fimidara-on-append-create-if-not-exists': 'true',
        },
        pipe: vi.fn(),
      } as unknown as Request;

      let fileHandler: (filename: string, stream: Readable, info: any) => void;
      mockBusboy.on.mockImplementation((event: string, handler: any) => {
        if (event === 'file') {
          fileHandler = handler;
        }
      });

      const promise = getDataFromReq(req) as Promise<UploadFileEndpointParams>;

      fileHandler!('test.txt', mockFileStream, {
        mimeType: 'text/plain',
        encoding: 'utf-8',
      });

      const result = await promise;

      expect(result.onAppendCreateIfNotExists).toBe(true);
    });

    test('extracts onAppendCreateIfNotExists header as true when set to "1"', async () => {
      const endpoints = getFilesHttpEndpoints();
      const getDataFromReq = endpoints.uploadFile.getDataFromReq!;

      const req = {
        path: `/api/v1/files/uploadFile/workspace-rootname/file.txt`,
        headers: {
          'x-fimidara-append': 'true',
          'x-fimidara-on-append-create-if-not-exists': '1',
        },
        pipe: vi.fn(),
      } as unknown as Request;

      let fileHandler: (filename: string, stream: Readable, info: any) => void;
      mockBusboy.on.mockImplementation((event: string, handler: any) => {
        if (event === 'file') {
          fileHandler = handler;
        }
      });

      const promise = getDataFromReq(req) as Promise<UploadFileEndpointParams>;

      fileHandler!('test.txt', mockFileStream, {
        mimeType: 'text/plain',
        encoding: 'utf-8',
      });

      const result = await promise;

      expect(result.onAppendCreateIfNotExists).toBe(true);
    });

    test('extracts onAppendCreateIfNotExists header as undefined when set to "false"', async () => {
      const endpoints = getFilesHttpEndpoints();
      const getDataFromReq = endpoints.uploadFile.getDataFromReq!;

      const req = {
        path: `/api/v1/files/uploadFile/workspace-rootname/file.txt`,
        headers: {
          'x-fimidara-append': 'true',
          'x-fimidara-on-append-create-if-not-exists': 'false',
        },
        pipe: vi.fn(),
      } as unknown as Request;

      let fileHandler: (filename: string, stream: Readable, info: any) => void;
      mockBusboy.on.mockImplementation((event: string, handler: any) => {
        if (event === 'file') {
          fileHandler = handler;
        }
      });

      const promise = getDataFromReq(req) as Promise<UploadFileEndpointParams>;

      fileHandler!('test.txt', mockFileStream, {
        mimeType: 'text/plain',
        encoding: 'utf-8',
      });

      const result = await promise;

      expect(result.onAppendCreateIfNotExists).toBeUndefined();
    });

    test('extracts both append headers together', async () => {
      const endpoints = getFilesHttpEndpoints();
      const getDataFromReq = endpoints.uploadFile.getDataFromReq!;

      const req = {
        path: `/api/v1/files/uploadFile/workspace-rootname/file.txt`,
        headers: {
          'x-fimidara-append': 'true',
          'x-fimidara-on-append-create-if-not-exists': 'false',
        },
        pipe: vi.fn(),
      } as unknown as Request;

      let fileHandler: (filename: string, stream: Readable, info: any) => void;
      mockBusboy.on.mockImplementation((event: string, handler: any) => {
        if (event === 'file') {
          fileHandler = handler;
        }
      });

      const promise = getDataFromReq(req) as Promise<UploadFileEndpointParams>;

      fileHandler!('test.txt', mockFileStream, {
        mimeType: 'text/plain',
        encoding: 'utf-8',
      });

      const result = await promise;

      expect(result.append).toBe(true);
      expect(result.onAppendCreateIfNotExists).toBeUndefined();
    });

    test('extracts append headers from busboy field event', async () => {
      const endpoints = getFilesHttpEndpoints();
      const getDataFromReq = endpoints.uploadFile.getDataFromReq!;

      const req = {
        path: `/api/v1/files/uploadFile/workspace-rootname/file.txt`,
        headers: {
          'x-fimidara-append': 'true',
          'x-fimidara-on-append-create-if-not-exists': 'true',
        },
        pipe: vi.fn(),
      } as unknown as Request;

      let fieldHandler: (name: string, value: string, info: any) => void;
      mockBusboy.on.mockImplementation((event: string, handler: any) => {
        if (event === 'field') {
          fieldHandler = handler;
        }
      });

      const promise = getDataFromReq(req) as Promise<UploadFileEndpointParams>;

      fieldHandler!(kFileConstants.uploadedFileFieldName, 'field data', {
        mimeType: 'text/plain',
        encoding: 'utf-8',
      });

      const result = await promise;

      expect(result.append).toBe(true);
      expect(result.onAppendCreateIfNotExists).toBe(true);
    });
  });

  describe('cleanupUploadFileReq through endpoint', () => {
    test('cleans up busboy and request stream', () => {
      const endpoints = getFilesHttpEndpoints();
      const cleanup = endpoints.uploadFile.cleanup!;
      const cleanupFn = Array.isArray(cleanup) ? cleanup[0] : cleanup;

      const mockFileStream = {
        on: vi.fn(),
      } as any;
      const mockBusboy = {
        _fileStream: mockFileStream,
        destroy: vi.fn(),
      } as any;
      const req = {
        busboy: mockBusboy,
        unpipe: vi.fn(),
        destroy: vi.fn(),
      } as unknown as Request;

      cleanupFn(req, {} as Response);

      expect(mockFileStream.on).toHaveBeenCalledWith(
        'error',
        expect.any(Function)
      );
      expect(req.unpipe).toHaveBeenCalledWith(mockBusboy);
      expect(mockBusboy.destroy).toHaveBeenCalled();
      expect(req.destroy).toHaveBeenCalled();
    });

    test('handles request without busboy gracefully', () => {
      const endpoints = getFilesHttpEndpoints();
      const cleanup = endpoints.uploadFile.cleanup!;
      const cleanupFn = Array.isArray(cleanup) ? cleanup[0] : cleanup;

      const req = {} as Request;

      expect(() => cleanupFn(req, {} as Response)).not.toThrow();
    });

    test('handles busboy without _fileStream', () => {
      const endpoints = getFilesHttpEndpoints();
      const cleanup = endpoints.uploadFile.cleanup!;
      const cleanupFn = Array.isArray(cleanup) ? cleanup[0] : cleanup;

      const mockBusboy = {
        destroy: vi.fn(),
      } as any;
      const req = {
        busboy: mockBusboy,
        unpipe: vi.fn(),
        destroy: vi.fn(),
      } as unknown as Request;

      expect(() => cleanupFn(req, {} as Response)).not.toThrow();
      expect(mockBusboy.destroy).toHaveBeenCalled();
    });
  });

  describe('handleReadFileHEADResponse through endpoint', () => {
    test('sets correct headers for HEAD response', async () => {
      const endpoints = getFilesHttpEndpoints();
      const handleResponse = endpoints.readFile[2].handleResponse!;

      const res = {
        setHeader: vi.fn(),
        set: vi.fn().mockReturnThis(),
        status: vi.fn().mockReturnThis(),
        end: vi.fn(),
      } as unknown as Response;

      const result = {
        contentLength: 1000,
        mimetype: 'text/plain',
        name: 'test',
        ext: 'txt',
        lastModified: Date.now(),
        etag: '"etag-value"',
        stream: Readable.from(['']),
      };

      const input: ReadFileEndpointParams = {
        filepath: 'workspace-rootname/file.txt',
      };

      await handleResponse(res, result, {} as Request, input);

      expect(res.setHeader).toHaveBeenCalledWith('Accept-Ranges', 'bytes');
      expect(res.setHeader).toHaveBeenCalledWith(
        'Last-Modified',
        expect.any(String)
      );
      expect(res.setHeader).toHaveBeenCalledWith('ETag', '"etag-value"');
      expect(res.set).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalled();
      expect(res.end).toHaveBeenCalled();
    });

    test('sets Content-Disposition header when download is true', async () => {
      const endpoints = getFilesHttpEndpoints();
      const handleResponse = endpoints.readFile[2].handleResponse!;

      const res = {
        setHeader: vi.fn(),
        set: vi.fn().mockReturnThis(),
        status: vi.fn().mockReturnThis(),
        end: vi.fn(),
      } as unknown as Response;

      const result = {
        contentLength: 1000,
        mimetype: 'text/plain',
        name: 'test',
        ext: 'txt',
        stream: Readable.from(['']),
      };

      const input: ReadFileEndpointParams = {
        filepath: 'workspace-rootname/file.txt',
        download: true,
      };

      await handleResponse(res, result, {} as Request, input);

      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename="test.txt"'
      );
      expect(res.setHeader).toHaveBeenCalledWith(
        'Cross-Origin-Resource-Policy',
        'cross-origin'
      );
    });

    test('handles file without extension', async () => {
      const endpoints = getFilesHttpEndpoints();
      const handleResponse = endpoints.readFile[2].handleResponse!;

      const res = {
        setHeader: vi.fn(),
        set: vi.fn().mockReturnThis(),
        status: vi.fn().mockReturnThis(),
        end: vi.fn(),
      } as unknown as Response;

      const result = {
        contentLength: 1000,
        name: 'test',
        stream: Readable.from(['']),
      };

      const input: ReadFileEndpointParams = {
        filepath: 'workspace-rootname/file',
        download: true,
      };

      await handleResponse(res, result, {} as Request, input);

      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename="test"'
      );
    });
  });

  describe('handleReadFileResponse through endpoint', () => {
    test('handles full file response without ranges', async () => {
      const endpoints = getFilesHttpEndpoints();
      const handleResponse = endpoints.readFile[0].handleResponse!;

      const mockStream = Readable.from(['test data']);
      const mockResponseStream = new PassThrough();
      const res = {
        setHeader: vi.fn(),
        set: vi.fn().mockReturnThis(),
        status: vi.fn().mockReturnThis(),
        pipe: vi.fn(),
        writable: true,
        on: mockResponseStream.on.bind(mockResponseStream),
        once: mockResponseStream.once.bind(mockResponseStream),
        emit: mockResponseStream.emit.bind(mockResponseStream),
        end: vi.fn(),
        destroy: vi.fn(),
      } as unknown as Response;

      const result: ReadFileEndpointResult = {
        contentLength: 1000,
        mimetype: 'text/plain',
        name: 'file',
        stream: mockStream,
      };

      const input: ReadFileEndpointParams = {
        filepath: 'workspace-rootname/file.txt',
      };

      await handleResponse(res, result, {} as Request, input);

      expect(res.setHeader).toHaveBeenCalledWith('Accept-Ranges', 'bytes');
      expect(res.set).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalled();
    });

    test('handles single range response', async () => {
      const endpoints = getFilesHttpEndpoints();
      const handleResponse = endpoints.readFile[0].handleResponse!;

      const mockStream = Readable.from(['range data']);
      const mockResponseStream = new PassThrough();
      const res = {
        setHeader: vi.fn(),
        set: vi.fn().mockReturnThis(),
        status: vi.fn().mockReturnThis(),
        pipe: vi.fn(),
        writable: true,
        on: mockResponseStream.on.bind(mockResponseStream),
        once: mockResponseStream.once.bind(mockResponseStream),
        emit: mockResponseStream.emit.bind(mockResponseStream),
        end: vi.fn(),
        destroy: vi.fn(),
      } as unknown as Response;

      const result: ReadFileEndpointResult = {
        contentLength: 1000,
        mimetype: 'text/plain',
        name: 'file',
        stream: mockStream,
        ranges: [{start: 0, end: 499}],
        isMultipart: false,
      };

      const input: ReadFileEndpointParams = {
        filepath: 'workspace-rootname/file.txt',
      };

      await handleResponse(res, result, {} as Request, input);

      expect(res.setHeader).toHaveBeenCalledWith('Accept-Ranges', 'bytes');
      expect(res.set).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(206);
    });

    test('handles multipart range response', async () => {
      const endpoints = getFilesHttpEndpoints();
      const handleResponse = endpoints.readFile[0].handleResponse!;

      const mockStream1 = Readable.from(['range1']);
      const mockStream2 = Readable.from(['range2']);
      const mockResponseStream = new PassThrough();
      const res = {
        setHeader: vi.fn(),
        set: vi.fn().mockReturnThis(),
        status: vi.fn().mockReturnThis(),
        pipe: vi.fn(),
        writable: true,
        on: mockResponseStream.on.bind(mockResponseStream),
        once: mockResponseStream.once.bind(mockResponseStream),
        emit: mockResponseStream.emit.bind(mockResponseStream),
        end: vi.fn(),
        destroy: vi.fn(),
      } as unknown as Response;

      const result: ReadFileEndpointResult = {
        contentLength: 1000,
        mimetype: 'text/plain',
        name: 'file',
        stream: [mockStream1, mockStream2],
        ranges: [
          {start: 0, end: 99},
          {start: 200, end: 299},
        ],
        isMultipart: true,
      };

      const input: ReadFileEndpointParams = {
        filepath: 'workspace-rootname/file.txt',
      };

      await handleResponse(res, result, {} as Request, input);

      expect(res.setHeader).toHaveBeenCalledWith('Accept-Ranges', 'bytes');
      expect(res.set).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(206);
    });

    test('sets Content-Disposition header when download is true', async () => {
      const endpoints = getFilesHttpEndpoints();
      const handleResponse = endpoints.readFile[0].handleResponse!;

      const mockStream = Readable.from(['test data']);
      const mockResponseStream = new PassThrough();
      const res = {
        setHeader: vi.fn(),
        set: vi.fn().mockReturnThis(),
        status: vi.fn().mockReturnThis(),
        pipe: vi.fn(),
        writable: true,
        on: mockResponseStream.on.bind(mockResponseStream),
        once: mockResponseStream.once.bind(mockResponseStream),
        emit: mockResponseStream.emit.bind(mockResponseStream),
        end: vi.fn(),
        destroy: vi.fn(),
      } as unknown as Response;

      const result = {
        contentLength: 1000,
        mimetype: 'text/plain',
        name: 'test',
        ext: 'txt',
        stream: mockStream,
      };

      const input: ReadFileEndpointParams = {
        filepath: 'workspace-rootname/file.txt',
        download: true,
      };

      await handleResponse(res, result, {} as Request, input);

      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename="test.txt"'
      );
      expect(res.setHeader).toHaveBeenCalledWith(
        'Cross-Origin-Resource-Policy',
        'cross-origin'
      );
    });
  });

  describe('handleNotFoundError through endpoint', () => {
    test('calls populateMountUnsupportedOpNoteInNotFoundError and defers handling', () => {
      // Verify the mock is set up correctly
      expect(
        mountUtilsModule.populateMountUnsupportedOpNoteInNotFoundError
      ).toBeDefined();
      const mockFn = vi.mocked(
        mountUtilsModule.populateMountUnsupportedOpNoteInNotFoundError
      );
      expect(vi.isMockFunction(mockFn)).toBe(true);
      mockFn.mockClear();
      const endpoints = getFilesHttpEndpoints();
      const handleError = endpoints.deleteFile.handleError!;

      const res = {} as Response;
      const processedErrors: FimidaraExternalError[] = [];
      const caughtErrors = new Error('Not found');

      const result = handleError(res, processedErrors, caughtErrors);

      expect(mockFn).toHaveBeenCalledWith(processedErrors);
      expect(result).toBe(true);
    });
  });

  describe('handleReadFileError through endpoint', () => {
    test('handles RangeNotSatisfiableError correctly', () => {
      const endpoints = getFilesHttpEndpoints();
      const handleError = endpoints.readFile[0].handleError!;

      const res = {
        setHeader: vi.fn(),
      } as unknown as Response;
      const processedErrors: FimidaraExternalError[] = [];
      const rangeError = new RangeNotSatisfiableError({fileSize: 1000});

      const result = handleError(res, processedErrors, rangeError);

      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Range',
        'bytes */1000'
      );
      expect(result).toBe(true);
    });

    test('handles RangeNotSatisfiableError in array of errors', () => {
      const endpoints = getFilesHttpEndpoints();
      const handleError = endpoints.readFile[0].handleError!;

      const res = {
        setHeader: vi.fn(),
      } as unknown as Response;
      const processedErrors: FimidaraExternalError[] = [];
      const rangeError = new RangeNotSatisfiableError({fileSize: 500});
      const otherError = new Error('Other error');

      const result = handleError(res, processedErrors, [
        otherError,
        rangeError,
      ]);

      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Range',
        'bytes */500'
      );
      expect(result).toBe(true);
    });

    test('delegates to handleNotFoundError for non-range errors', () => {
      const mockFn = vi.mocked(
        mountUtilsModule.populateMountUnsupportedOpNoteInNotFoundError
      );
      mockFn.mockClear();
      const endpoints = getFilesHttpEndpoints();
      const handleError = endpoints.readFile[0].handleError!;

      const res = {} as Response;
      const processedErrors: FimidaraExternalError[] = [];
      const otherError = new Error('Other error');

      const result = handleError(res, processedErrors, otherError);

      expect(mockFn).toHaveBeenCalledWith(processedErrors);
      expect(result).toBe(true);
    });

    test('handles RangeNotSatisfiableError with undefined fileSize', () => {
      const endpoints = getFilesHttpEndpoints();
      const handleError = endpoints.readFile[0].handleError!;

      const res = {
        setHeader: vi.fn(),
      } as unknown as Response;
      const processedErrors: FimidaraExternalError[] = [];
      const rangeError = new RangeNotSatisfiableError();

      const result = handleError(res, processedErrors, rangeError);

      expect(res.setHeader).toHaveBeenCalledWith('Content-Range', 'bytes */0');
      expect(result).toBe(true);
    });
  });
});
