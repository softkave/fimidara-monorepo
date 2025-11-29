import assert from 'assert';
import {expectErrorThrownAsync} from 'softkave-js-utils';
import {Readable} from 'stream';
import {describe, expect, test} from 'vitest';
import {streamToBuffer} from '../../../utils/fns.js';
import {InvalidRequestError} from '../../errors.js';
import {
  calculateMultipartContentLength,
  formatMultipartBoundary,
  formatMultipartResponse,
  generateETag,
  parseRangeHeader,
  validateIfRange,
} from './utils.js';

describe('parseRangeHeader', () => {
  test('returns null for undefined range header', () => {
    expect(parseRangeHeader(undefined, 1000)).toBeNull();
  });

  test('returns null for empty file size', () => {
    expect(parseRangeHeader('bytes=0-499', 0)).toBeNull();
  });

  test('returns null for invalid range header format', () => {
    expect(parseRangeHeader('invalid', 1000)).toBeNull();
    expect(parseRangeHeader('bytes=', 1000)).toBeNull();
    expect(parseRangeHeader('other=0-499', 1000)).toBeNull();
  });

  test('parses single range', () => {
    const result = parseRangeHeader('bytes=0-499', 1000);
    expect(result).toEqual([{start: 0, end: 499}]);
  });

  test('parses multiple ranges', () => {
    const result = parseRangeHeader('bytes=0-499,1000-1499', 2000);
    expect(result).toEqual([
      {start: 0, end: 499},
      {start: 1000, end: 1499},
    ]);
  });

  test('parses multiple ranges with spaces', () => {
    const result = parseRangeHeader('bytes=0-499, 1000-1499', 2000);
    expect(result).toEqual([
      {start: 0, end: 499},
      {start: 1000, end: 1499},
    ]);
  });

  test('parses suffix range', () => {
    const result = parseRangeHeader('bytes=-500', 1000);
    expect(result).toEqual([{start: 500, end: 999}]);
  });

  test('parses suffix range larger than file', () => {
    const result = parseRangeHeader('bytes=-2000', 1000);
    expect(result).toEqual([{start: 0, end: 999}]);
  });

  test('parses open-ended range', () => {
    const result = parseRangeHeader('bytes=9500-', 10000);
    expect(result).toEqual([{start: 9500, end: 9999}]);
  });

  test('clamps end range to file size', () => {
    const result = parseRangeHeader('bytes=500-2000', 1000);
    expect(result).toEqual([{start: 500, end: 999}]);
  });

  test('returns null for invalid suffix range', () => {
    expect(parseRangeHeader('bytes=-0', 1000)).toBeNull();
    expect(parseRangeHeader('bytes=-', 1000)).toBeNull();
    expect(parseRangeHeader('bytes=-abc', 1000)).toBeNull();
  });

  test('returns null for invalid open-ended range', () => {
    expect(parseRangeHeader('bytes=-', 1000)).toBeNull();
    expect(parseRangeHeader('bytes=abc-', 1000)).toBeNull();
    expect(parseRangeHeader('bytes=-1-', 1000)).toBeNull();
  });

  test('returns null for start > end', () => {
    expect(parseRangeHeader('bytes=500-400', 1000)).toBeNull();
  });

  test('returns null for negative start or end', () => {
    expect(parseRangeHeader('bytes=-100-200', 1000)).toBeNull();
    expect(parseRangeHeader('bytes=100--200', 1000)).toBeNull();
  });

  test('returns null for invalid range format', () => {
    expect(parseRangeHeader('bytes=100', 1000)).toBeNull();
    expect(parseRangeHeader('bytes=100-200-300', 1000)).toBeNull();
  });

  test('merges overlapping ranges', () => {
    const result = parseRangeHeader('bytes=0-100,50-150', 1000);
    expect(result).toEqual([{start: 0, end: 150}]);
  });

  test('merges adjacent ranges', () => {
    const result = parseRangeHeader('bytes=0-99,100-199', 1000);
    expect(result).toEqual([{start: 0, end: 199}]);
  });

  test('sorts and merges multiple overlapping ranges', () => {
    const result = parseRangeHeader('bytes=100-200,0-150,250-300', 1000);
    expect(result).toEqual([
      {start: 0, end: 200},
      {start: 250, end: 300},
    ]);
  });

  test('handles case-insensitive bytes unit', () => {
    const result = parseRangeHeader('BYTES=0-499', 1000);
    expect(result).toEqual([{start: 0, end: 499}]);
  });

  test('returns null when start range is beyond file size (shouldClamp=false)', () => {
    // Default behavior: return null when range is not satisfiable
    expect(parseRangeHeader('bytes=1000-2000', 500)).toBeNull();
  });

  test('clamps start range when shouldClamp=true', () => {
    // When shouldClamp is true, clamp start to file size
    const result = parseRangeHeader('bytes=1000-2000', 500, true);
    expect(result).toEqual([{start: 499, end: 499}]);
  });

  test('returns null for open-ended range when start is beyond file size (shouldClamp=false)', () => {
    // Default behavior: return null when range is not satisfiable
    expect(parseRangeHeader('bytes=1000-', 500)).toBeNull();
  });

  test('clamps open-ended range when shouldClamp=true', () => {
    // When shouldClamp is true, clamp start to file size
    const result = parseRangeHeader('bytes=1000-', 500, true);
    expect(result).toEqual([{start: 499, end: 499}]);
  });

  test('always clamps end range regardless of shouldClamp', () => {
    // End should always be clamped, even when shouldClamp is false
    const result1 = parseRangeHeader('bytes=0-2000', 1000, false);
    expect(result1).toEqual([{start: 0, end: 999}]);

    const result2 = parseRangeHeader('bytes=0-2000', 1000, true);
    expect(result2).toEqual([{start: 0, end: 999}]);
  });
});

describe('validateIfRange', () => {
  test('returns true when If-Range header is undefined', () => {
    expect(validateIfRange(undefined, 1000, '"etag"')).toBe(true);
  });

  test('returns true when If-Range matches ETag', () => {
    const etag = '"abc123"';
    expect(validateIfRange(etag, undefined, etag)).toBe(true);
  });

  test('returns false when If-Range does not match ETag', () => {
    expect(validateIfRange('"etag1"', undefined, '"etag2"')).toBe(false);
  });

  test('validates If-Range with Last-Modified date within tolerance', () => {
    const lastModified = 1000000;
    const ifRangeDate = new Date(lastModified).toUTCString();
    expect(validateIfRange(ifRangeDate, lastModified, undefined)).toBe(true);
  });

  test('validates If-Range with Last-Modified date within 1 second tolerance', () => {
    const lastModified = 1000000;
    const ifRangeDate = new Date(lastModified + 500).toUTCString();
    expect(validateIfRange(ifRangeDate, lastModified, undefined)).toBe(true);
  });

  test('returns false when If-Range date is outside tolerance', () => {
    const lastModified = 1000000;
    const ifRangeDate = new Date(lastModified + 2000).toUTCString();
    expect(validateIfRange(ifRangeDate, lastModified, undefined)).toBe(false);
  });

  test('returns false when If-Range is date but lastModified is undefined', () => {
    const ifRangeDate = new Date(1000000).toUTCString();
    expect(validateIfRange(ifRangeDate, undefined, undefined)).toBe(false);
  });

  test('returns false when If-Range is ETag but etag is undefined', () => {
    expect(validateIfRange('"etag"', 1000, undefined)).toBe(false);
  });

  test('throws error for weak ETag in etag parameter', async () => {
    await expectErrorThrownAsync(
      async () => {
        validateIfRange('"etag"', undefined, 'W/"etag"');
      },
      {
        expectFn: error => {
          expect(error).toBeInstanceOf(InvalidRequestError);
          assert.ok(error instanceof InvalidRequestError);
          expect(error.message).toContain('Weak entity tag');
        },
      }
    );
  });

  test('throws error for weak ETag in ifRange parameter', async () => {
    await expectErrorThrownAsync(
      async () => {
        validateIfRange('W/"etag"', undefined, '"etag"');
      },
      {
        expectFn: error => {
          expect(error).toBeInstanceOf(InvalidRequestError);
          assert.ok(error instanceof InvalidRequestError);
          expect(error.message).toContain('Weak entity tag');
        },
      }
    );
  });

  test('prefers ETag validation when both ETag and lastModified are provided', () => {
    const etag = '"abc123"';
    expect(validateIfRange(etag, 1000, etag)).toBe(true);
    expect(validateIfRange('"wrong"', 1000, etag)).toBe(false);
  });
});

describe('generateETag', () => {
  test('generates ETag from lastModified and size', () => {
    const lastModified = 1000000;
    const size = 5000;
    const etag = generateETag(lastModified, size);
    expect(etag).toMatch(/^".+"$/);
    expect(etag.length).toBeGreaterThan(2);
  });

  test('generates same ETag for same inputs', () => {
    const lastModified = 1000000;
    const size = 5000;
    const etag1 = generateETag(lastModified, size);
    const etag2 = generateETag(lastModified, size);
    expect(etag1).toBe(etag2);
  });

  test('generates different ETag for different inputs', () => {
    const etag1 = generateETag(1000000, 5000);
    const etag2 = generateETag(1000001, 5000);
    const etag3 = generateETag(1000000, 5001);
    expect(etag1).not.toBe(etag2);
    expect(etag1).not.toBe(etag3);
  });

  test('returns empty string when lastModified is undefined', () => {
    expect(generateETag(undefined, 5000)).toBe('');
  });

  test('returns empty string when size is undefined', () => {
    expect(generateETag(1000000, undefined)).toBe('');
  });

  test('returns empty string when both are undefined', () => {
    expect(generateETag(undefined, undefined)).toBe('');
  });

  test('generates strong ETag format (with quotes)', () => {
    const etag = generateETag(1000000, 5000);
    expect(etag.startsWith('"')).toBe(true);
    expect(etag.endsWith('"')).toBe(true);
  });
});

describe('formatMultipartBoundary', () => {
  test('generates boundary string', () => {
    const boundary = formatMultipartBoundary();
    expect(boundary).toMatch(/^----fimidara-range-[a-f0-9]+$/);
  });

  test('generates unique boundaries', () => {
    const boundary1 = formatMultipartBoundary();
    // Small delay to ensure different timestamp
    const boundary2 = formatMultipartBoundary();
    // They might be the same if generated very quickly, but format should be correct
    expect(boundary1).toMatch(/^----fimidara-range-[a-f0-9]+$/);
    expect(boundary2).toMatch(/^----fimidara-range-[a-f0-9]+$/);
  });

  test('generates boundary with correct prefix', () => {
    const boundary = formatMultipartBoundary();
    expect(boundary.startsWith('----fimidara-range-')).toBe(true);
  });
});

describe('calculateMultipartContentLength', () => {
  test('calculates content length for single range', () => {
    const ranges = [{start: 0, end: 99}];
    const fileSize = 1000;
    const contentType = 'text/plain';
    const boundary = '----fimidara-range-abc123';

    const length = calculateMultipartContentLength(
      ranges,
      fileSize,
      contentType,
      boundary
    );

    // Manual calculation:
    // Opening boundary: --boundary\r\n = 2 + 24 + 2 = 28
    // Content-Type: Content-Type: text/plain\r\n = 14 + 10 + 2 = 26
    // Content-Range: Content-Range: bytes 0-99/1000\r\n = 18 + 1 + 1 + 1 + 4 + 2 = 27
    // Empty lines: \r\n\r\n = 4
    // Data: 100 bytes
    // Separator: \r\n = 2
    // Closing boundary: \r\n--boundary--\r\n = 2 + 2 + 24 + 2 + 2 = 32
    // Total: 28 + 26 + 27 + 4 + 100 + 2 + 32 = 219
    expect(length).toBeGreaterThan(100);
    expect(length).toBeLessThan(300);
  });

  test('calculates content length for multiple ranges', () => {
    const ranges = [
      {start: 0, end: 99},
      {start: 200, end: 299},
    ];
    const fileSize = 1000;
    const contentType = 'text/plain';
    const boundary = '----fimidara-range-abc123';

    const length = calculateMultipartContentLength(
      ranges,
      fileSize,
      contentType,
      boundary
    );

    // Should be larger than single range
    expect(length).toBeGreaterThan(200);
  });

  test('content length matches actual multipart response size', async () => {
    const ranges = [
      {start: 0, end: 4},
      {start: 10, end: 14},
    ];
    const fileSize = 20;
    const contentType = 'text/plain';
    const boundary = formatMultipartBoundary();

    const calculatedLength = calculateMultipartContentLength(
      ranges,
      fileSize,
      contentType,
      boundary
    );

    // Create actual multipart response
    const fileContent = Buffer.from('0123456789ABCDEFGHIJ');
    const streams = ranges.map(range => {
      const chunk = fileContent.slice(range.start, range.end + 1);
      return Readable.from([chunk]);
    });

    const multipartStream = formatMultipartResponse(
      streams,
      ranges,
      fileSize,
      contentType,
      boundary
    );

    const actualBuffer = await streamToBuffer(multipartStream);
    const actualLength = actualBuffer.length;

    expect(calculatedLength).toBe(actualLength);
  });

  test('handles large ranges correctly', () => {
    const ranges = [{start: 0, end: 999999}];
    const fileSize = 1000000;
    const contentType = 'application/octet-stream';
    const boundary = '----fimidara-range-abc123';

    const length = calculateMultipartContentLength(
      ranges,
      fileSize,
      contentType,
      boundary
    );

    // Should include the 1,000,000 bytes of data
    expect(length).toBeGreaterThan(1000000);
  });
});

describe('formatMultipartResponse', () => {
  test('creates multipart response for single range', async () => {
    const ranges = [{start: 0, end: 4}];
    const fileSize = 20;
    const contentType = 'text/plain';
    const boundary = formatMultipartBoundary();

    const fileContent = Buffer.from('0123456789ABCDEFGHIJ');
    const streams = ranges.map(range => {
      const chunk = fileContent.slice(range.start, range.end + 1);
      return Readable.from([chunk]);
    });

    const multipartStream = formatMultipartResponse(
      streams,
      ranges,
      fileSize,
      contentType,
      boundary
    );

    const result = await streamToBuffer(multipartStream);
    const resultStr = result.toString();

    expect(resultStr).toContain(`--${boundary}`);
    expect(resultStr).toContain(`Content-Type: ${contentType}`);
    expect(resultStr).toContain(`Content-Range: bytes 0-4/${fileSize}`);
    expect(resultStr).toContain('01234');
    expect(resultStr).toContain(`--${boundary}--`);
  });

  test('creates multipart response for multiple ranges', async () => {
    const ranges = [
      {start: 0, end: 4},
      {start: 10, end: 14},
    ];
    const fileSize = 20;
    const contentType = 'text/plain';
    const boundary = formatMultipartBoundary();

    const fileContent = Buffer.from('0123456789ABCDEFGHIJ');
    const streams = ranges.map(range => {
      const chunk = fileContent.slice(range.start, range.end + 1);
      return Readable.from([chunk]);
    });

    const multipartStream = formatMultipartResponse(
      streams,
      ranges,
      fileSize,
      contentType,
      boundary
    );

    const result = await streamToBuffer(multipartStream);
    const resultStr = result.toString();

    // Should contain both ranges
    expect(resultStr).toContain(`Content-Range: bytes 0-4/${fileSize}`);
    expect(resultStr).toContain(`Content-Range: bytes 10-14/${fileSize}`);
    expect(resultStr).toContain('01234');
    expect(resultStr).toContain('ABCDE');
    expect(resultStr).toContain(`--${boundary}--`);
  });

  test('handles stream errors', async () => {
    const ranges = [{start: 0, end: 4}];
    const fileSize = 20;
    const contentType = 'text/plain';
    const boundary = formatMultipartBoundary();

    const errorStream = new Readable({
      read() {
        this.destroy(new Error('Stream error'));
      },
    });

    const multipartStream = formatMultipartResponse(
      [errorStream],
      ranges,
      fileSize,
      contentType,
      boundary
    );

    await expectErrorThrownAsync(
      async () => {
        await streamToBuffer(multipartStream);
      },
      {
        expectFn: error => {
          expect((error as Error).message).toContain('Stream error');
        },
      }
    );
  });

  test('properly formats multipart headers', async () => {
    const ranges = [{start: 5, end: 9}];
    const fileSize = 100;
    const contentType = 'application/json';
    const boundary = '----fimidara-range-test123';

    const fileContent = Buffer.from('0123456789');
    const streams = ranges.map(range => {
      const chunk = fileContent.slice(range.start, range.end + 1);
      return Readable.from([chunk]);
    });

    const multipartStream = formatMultipartResponse(
      streams,
      ranges,
      fileSize,
      contentType,
      boundary
    );

    const result = await streamToBuffer(multipartStream);
    const resultStr = result.toString();

    // Check exact format
    const expectedStart = `--${boundary}\r\nContent-Type: ${contentType}\r\nContent-Range: bytes ${ranges[0].start}-${ranges[0].end}/${fileSize}\r\n\r\n`;
    expect(resultStr.startsWith(expectedStart)).toBe(true);
    expect(resultStr.endsWith(`\r\n--${boundary}--\r\n`)).toBe(true);
  });

  test('handles empty stream', async () => {
    const ranges = [{start: 0, end: 0}];
    const fileSize = 1;
    const contentType = 'text/plain';
    const boundary = formatMultipartBoundary();

    const emptyStream = Readable.from([Buffer.from('')]);
    const multipartStream = formatMultipartResponse(
      [emptyStream],
      ranges,
      fileSize,
      contentType,
      boundary
    );

    const result = await streamToBuffer(multipartStream);
    const resultStr = result.toString();

    expect(resultStr).toContain(`--${boundary}`);
    expect(resultStr).toContain(`Content-Range: bytes 0-0/${fileSize}`);
    expect(resultStr).toContain(`--${boundary}--`);
  });

  test('handles multiple streams in correct order', async () => {
    const ranges = [
      {start: 0, end: 2},
      {start: 5, end: 7},
      {start: 10, end: 12},
    ];
    const fileSize = 20;
    const contentType = 'text/plain';
    const boundary = formatMultipartBoundary();

    const fileContent = Buffer.from('0123456789ABCDEFGHIJ');
    const streams = ranges.map(range => {
      const chunk = fileContent.slice(range.start, range.end + 1);
      return Readable.from([chunk]);
    });

    const multipartStream = formatMultipartResponse(
      streams,
      ranges,
      fileSize,
      contentType,
      boundary
    );

    const result = await streamToBuffer(multipartStream);
    const resultStr = result.toString();

    // Verify ranges appear in order
    const firstRangeIndex = resultStr.indexOf('Content-Range: bytes 0-2/');
    const secondRangeIndex = resultStr.indexOf('Content-Range: bytes 5-7/');
    const thirdRangeIndex = resultStr.indexOf('Content-Range: bytes 10-12/');

    expect(firstRangeIndex).toBeLessThan(secondRangeIndex);
    expect(secondRangeIndex).toBeLessThan(thirdRangeIndex);
  });
});
