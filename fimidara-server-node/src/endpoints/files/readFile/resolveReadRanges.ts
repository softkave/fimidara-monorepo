import {RangeNotSatisfiableError} from '../errors.js';
import {
  mergeAndSortRanges,
  parseRangeHeader,
  Range,
  validateIfRange,
  validateRanges,
} from './utils.js';

export type ResolveReadRangesParams = {
  ranges?: Range[];
  rangeHeader?: string;
  ifRangeHeader?: string;
  lastModified: number;
  etag: string;
  fileSize: number;
  /** When true (e.g. image transform), ranges are ignored. */
  disableRanges?: boolean;
};

/**
 * Resolve byte ranges from body `ranges` and/or HTTP `Range` / `If-Range`.
 * Returns undefined when the full file should be served.
 */
export function resolveReadRanges(
  params: ResolveReadRangesParams
): Range[] | undefined {
  if (params.disableRanges) {
    return undefined;
  }

  const shouldHonorRange =
    !params.ifRangeHeader ||
    validateIfRange(params.ifRangeHeader, params.lastModified, params.etag);

  let ranges = params.ranges;

  if (ranges && ranges.length > 0) {
    if (!shouldHonorRange) {
      ranges = undefined;
    } else {
      if (params.fileSize <= 0) {
        throw new RangeNotSatisfiableError({fileSize: 0});
      }
      const validatedRanges = validateRanges(ranges, params.fileSize);
      if (!validatedRanges) {
        throw new RangeNotSatisfiableError({fileSize: params.fileSize});
      }
      ranges = mergeAndSortRanges(validatedRanges);
    }
  }

  if (!ranges && params.rangeHeader) {
    if (params.fileSize > 0) {
      if (shouldHonorRange) {
        ranges = parseRangeHeader(params.rangeHeader, params.fileSize) ?? undefined;
        if (!ranges) {
          throw new RangeNotSatisfiableError({fileSize: params.fileSize});
        }
      }
    } else {
      throw new RangeNotSatisfiableError({fileSize: 0});
    }
  }

  return ranges;
}
