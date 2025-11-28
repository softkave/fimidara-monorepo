import {createHash} from 'crypto';
import {PassThrough, Readable} from 'stream';
import {InvalidRequestError} from '../../errors.js';

export interface Range {
  start: number;
  end: number;
}

/**
 * Parses the Range header value and returns an array of range objects.
 * Supports single and multiple ranges, suffix ranges, and open-ended ranges.
 *
 * @param rangeHeader - The Range header value (e.g., "bytes=0-499" or "bytes=0-499,1000-1499")
 * @param fileSize - The total size of the file in bytes
 * @param shouldClamp - If true, clamps ranges to file size. If false, returns null when range is not satisfiable.
 * @returns Array of range objects with start and end positions, or null if invalid
 */
export function parseRangeHeader(
  rangeHeader: string | undefined,
  fileSize: number,
  shouldClamp: boolean = false
): Range[] | null {
  if (!rangeHeader || !fileSize || fileSize <= 0) {
    return null;
  }

  // Range header format: "bytes=start-end" or "bytes=start-end,start-end"
  const match = rangeHeader.match(/^bytes=(.+)$/i);
  if (!match) {
    return null;
  }

  const rangesStr = match[1];
  const rangeStrings = rangesStr.split(',').map(s => s.trim());
  const ranges: Range[] = [];

  for (const rangeStr of rangeStrings) {
    // Handle suffix range: "-500" (last 500 bytes)
    if (rangeStr.startsWith('-')) {
      // Check if it's a valid suffix range (no additional dashes)
      const suffixPart = rangeStr.slice(1);
      if (suffixPart.includes('-')) {
        return null; // Invalid: contains multiple dashes like "-100-200" or "-1-"
      }
      const suffix = parseInt(suffixPart, 10);
      if (isNaN(suffix) || suffix <= 0) {
        return null;
      }
      const start = Math.max(0, fileSize - suffix);
      const end = fileSize - 1;
      ranges.push({start, end});
      continue;
    }

    // Handle open-ended range: "9500-" (from byte 9500 to end)
    if (rangeStr.endsWith('-')) {
      const startPart = rangeStr.slice(0, -1);
      // Check if start part is valid (no dashes, not empty)
      if (startPart.includes('-') || startPart === '') {
        return null; // Invalid: contains dashes like "-1-" or empty like "-"
      }
      const start = parseInt(startPart, 10);
      if (isNaN(start) || start < 0) {
        return null;
      }

      // Check if range is satisfiable
      if (!shouldClamp && start >= fileSize) {
        return null;
      }

      const clampedStart = shouldClamp ? Math.min(start, fileSize - 1) : start;
      const end = fileSize - 1;
      ranges.push({start: clampedStart, end});
      continue;
    }

    // Handle normal range: "start-end"
    const parts = rangeStr.split('-');
    if (parts.length !== 2) {
      return null;
    }

    const start = parseInt(parts[0], 10);
    const end = parseInt(parts[1], 10);

    if (isNaN(start) || isNaN(end) || start < 0 || end < 0) {
      return null;
    }

    // Validate range
    if (start > end) {
      return null;
    }

    // Check if range is satisfiable (start beyond file size)
    if (!shouldClamp && start >= fileSize) {
      return null;
    }

    // Clamp start if shouldClamp is true, otherwise use original start
    const clampedStart = shouldClamp ? Math.min(start, fileSize - 1) : start;
    // Always clamp end to file size
    const clampedEnd = Math.min(end, fileSize - 1);

    ranges.push({start: clampedStart, end: clampedEnd});
  }

  // Remove overlapping ranges and sort
  const sortedRanges = ranges.sort((a, b) => a.start - b.start);
  const mergedRanges: Range[] = [];

  for (const range of sortedRanges) {
    if (mergedRanges.length === 0) {
      mergedRanges.push(range);
      continue;
    }

    const last = mergedRanges[mergedRanges.length - 1];
    // If ranges overlap or are adjacent, merge them
    if (range.start <= last.end + 1) {
      last.end = Math.max(last.end, range.end);
    } else {
      mergedRanges.push(range);
    }
  }

  return mergedRanges.length > 0 ? mergedRanges : null;
}

/**
 * Validates the If-Range header against Last-Modified date or ETag.
 *
 * @param ifRange - The If-Range header value
 * @param lastModified - Last modified timestamp in milliseconds
 * @param etag - ETag value
 * @returns True if the condition matches, false otherwise
 */
export function validateIfRange(
  ifRange: string | undefined,
  lastModified: number | undefined,
  etag: string | undefined
): boolean {
  if (!ifRange) {
    return true; // No If-Range header means condition passes
  }

  // If-Range can be either a date or an ETag
  // Prefer ETag validation if both etag and lastModified are provided
  // and ifRange looks like an ETag (starts with quote)
  if (etag && ifRange.startsWith('"')) {
    // According to HTTP spec (RFC 7233), weak entity tags (prefixed by W/)
    // must not be used in the If-Range header
    if (etag.startsWith('W/')) {
      throw new InvalidRequestError(
        'Weak entity tag (W/) must not be used in If-Range header'
      );
    }
    if (ifRange.startsWith('W/')) {
      throw new InvalidRequestError(
        'Weak entity tag (W/) must not be used in If-Range header'
      );
    }

    // Compare ETags (both should be strong ETags at this point)
    return etag === ifRange;
  }

  // Try parsing as date if lastModified is provided
  if (lastModified) {
    try {
      const ifRangeDate = new Date(ifRange).getTime();
      // Check if it's a valid date (not NaN)
      if (!isNaN(ifRangeDate)) {
        // Allow 1 second tolerance for date comparison
        return Math.abs(ifRangeDate - lastModified) < 1000;
      }
    } catch {
      // Not a valid date, continue to ETag check
    }
  }

  // Try as ETag if etag is provided
  if (etag) {
    // According to HTTP spec (RFC 7233), weak entity tags (prefixed by W/)
    // must not be used in the If-Range header
    if (etag.startsWith('W/')) {
      throw new InvalidRequestError(
        'Weak entity tag (W/) must not be used in If-Range header'
      );
    }
    if (ifRange.startsWith('W/')) {
      throw new InvalidRequestError(
        'Weak entity tag (W/) must not be used in If-Range header'
      );
    }

    // Compare ETags (both should be strong ETags at this point)
    return etag === ifRange;
  }

  return false;
}

/**
 * Generates an ETag from lastModified timestamp and file size.
 *
 * @param lastModified - Last modified timestamp in milliseconds
 * @param size - File size in bytes
 * @returns ETag string (strong ETag format: "hash")
 */
export function generateETag(
  lastModified: number | undefined,
  size: number | undefined
): string {
  if (lastModified === undefined || size === undefined) {
    return '';
  }

  const hash = createHash('md5')
    .update(`${lastModified}-${size}`)
    .digest('hex');

  // Use strong ETag format
  return `"${hash}"`;
}

/**
 * Generates a unique boundary string for multipart responses.
 *
 * @returns Boundary string
 */
export function formatMultipartBoundary(): string {
  const random = createHash('md5')
    .update(`${Date.now()}-${Math.random()}`)
    .digest('hex')
    .substring(0, 16);
  return `----fimidara-range-${random}`;
}

// String constants used in multipart response formatting
// These must match exactly what's written in formatMultipartResponse
const MULTIPART_CRLF = '\r\n';
const MULTIPART_BOUNDARY_PREFIX = '--';
const MULTIPART_BOUNDARY_SUFFIX = '--';
const MULTIPART_CONTENT_TYPE_PREFIX = 'Content-Type: ';
const MULTIPART_CONTENT_RANGE_PREFIX = 'Content-Range: bytes ';
const MULTIPART_RANGE_SEPARATOR = '-';
const MULTIPART_RANGE_FILE_SIZE_SEPARATOR = '/';

// Byte lengths of the constants above
const MULTIPART_CRLF_LENGTH = Buffer.byteLength(MULTIPART_CRLF);
const MULTIPART_BOUNDARY_PREFIX_LENGTH = Buffer.byteLength(
  MULTIPART_BOUNDARY_PREFIX
);
const MULTIPART_BOUNDARY_SUFFIX_LENGTH = Buffer.byteLength(
  MULTIPART_BOUNDARY_SUFFIX
);
const MULTIPART_CONTENT_TYPE_PREFIX_LENGTH = Buffer.byteLength(
  MULTIPART_CONTENT_TYPE_PREFIX
);
const MULTIPART_CONTENT_RANGE_PREFIX_LENGTH = Buffer.byteLength(
  MULTIPART_CONTENT_RANGE_PREFIX
);
const MULTIPART_RANGE_SEPARATOR_LENGTH = Buffer.byteLength(
  MULTIPART_RANGE_SEPARATOR
);
const MULTIPART_RANGE_FILE_SIZE_SEPARATOR_LENGTH = Buffer.byteLength(
  MULTIPART_RANGE_FILE_SIZE_SEPARATOR
);

/**
 * Calculates the Content-Length for a multipart/byteranges response.
 *
 * NOTE: This function must be kept in sync with formatMultipartResponse.
 * If formatMultipartResponse is modified, this function must be updated accordingly.
 *
 * @param ranges - Array of ranges
 * @param fileSize - Total file size in bytes
 * @param contentType - Content type of the file
 * @param boundary - Multipart boundary string
 * @returns Total size in bytes of the multipart response
 */
export function calculateMultipartContentLength(
  ranges: Range[],
  fileSize: number,
  contentType: string,
  boundary: string
): number {
  let totalLength = 0;
  const boundaryLength = Buffer.byteLength(boundary);
  const contentTypeLength = Buffer.byteLength(contentType);

  for (const range of ranges) {
    // In formatMultipartResponse, partHeaders.join('\r\n') creates:
    // ['--boundary', 'Content-Type: ...', 'Content-Range: ...', '', ''].join('\r\n')
    // The join adds \r\n between each element (but not after the last)

    // Element 0: --boundary
    totalLength += MULTIPART_BOUNDARY_PREFIX_LENGTH + boundaryLength;
    totalLength += MULTIPART_CRLF_LENGTH; // join after element 0

    // Element 1: Content-Type: ${contentType}
    totalLength += MULTIPART_CONTENT_TYPE_PREFIX_LENGTH + contentTypeLength;
    totalLength += MULTIPART_CRLF_LENGTH; // join after element 1

    // Element 2: Content-Range: bytes ${start}-${end}/${fileSize}
    const rangeHeaderTextLength =
      MULTIPART_CONTENT_RANGE_PREFIX_LENGTH +
      Buffer.byteLength(String(range.start)) +
      MULTIPART_RANGE_SEPARATOR_LENGTH +
      Buffer.byteLength(String(range.end)) +
      MULTIPART_RANGE_FILE_SIZE_SEPARATOR_LENGTH +
      Buffer.byteLength(String(fileSize));
    totalLength += rangeHeaderTextLength;
    totalLength += MULTIPART_CRLF_LENGTH; // join after element 2

    // Element 3: '' (first empty string)
    totalLength += MULTIPART_CRLF_LENGTH; // join after element 3

    // Element 4: '' (second empty string, no join after last element)
    // No additional bytes

    // Data bytes for this range
    totalLength += range.end - range.start + 1;
  }

  // Closing boundary: \r\n--${boundary}--\r\n
  // Note: \r\n is only added before the closing boundary, not between parts
  totalLength +=
    MULTIPART_CRLF_LENGTH +
    MULTIPART_BOUNDARY_PREFIX_LENGTH +
    boundaryLength +
    MULTIPART_BOUNDARY_SUFFIX_LENGTH +
    MULTIPART_CRLF_LENGTH;

  return totalLength;
}

/**
 * Creates a multipart/byteranges response stream from multiple range streams.
 *
 * NOTE: If this function is modified, calculateMultipartContentLength must be
 * updated accordingly to maintain accurate Content-Length calculation.
 *
 * @param streams - Array of streams, one for each range
 * @param ranges - Array of ranges corresponding to the streams
 * @param fileSize - Total file size in bytes
 * @param contentType - Content type of the file
 * @param boundary - Multipart boundary string
 * @returns Combined multipart response stream
 */
export function formatMultipartResponse(
  streams: Readable[],
  ranges: Range[],
  fileSize: number,
  contentType: string,
  boundary: string
): Readable {
  const output = new PassThrough();

  async function writeMultipart() {
    try {
      for (let i = 0; i < streams.length; i++) {
        const range = ranges[i];
        const stream = streams[i];

        // Write boundary and headers for this part
        const partHeaders = [
          `--${boundary}`,
          `Content-Type: ${contentType}`,
          `Content-Range: bytes ${range.start}-${range.end}/${fileSize}`,
          '',
          '',
        ].join('\r\n');

        if (!output.write(partHeaders)) {
          await new Promise<void>(resolve => output.once('drain', resolve));
        }

        // Pipe the stream data
        await new Promise<void>((resolve, reject) => {
          stream.on('end', resolve);
          stream.on('error', reject);
          stream.pipe(output, {end: false});
        });
      }

      // Write closing boundary
      if (!output.write(`\r\n--${boundary}--\r\n`)) {
        await new Promise<void>(resolve => output.once('drain', resolve));
      }
      output.end();
    } catch (error) {
      output.destroy(error as Error);
    }
  }

  writeMultipart().catch(error => {
    output.destroy(error);
  });

  return output;
}
