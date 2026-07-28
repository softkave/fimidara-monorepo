/**
 * Retries Mongo operations that fail due to transient network / pool issues.
 */

export function isRetryableMongoNetworkError(err: unknown): boolean {
  if (err == null || typeof err !== 'object') {
    return false;
  }

  const e = err as {
    name?: string;
    message?: string;
    errorLabelSet?: Set<string> | {has?: (label: string) => boolean};
    errorResponse?: unknown;
    cause?: unknown;
  };

  const labels = e.errorLabelSet;
  if (
    labels &&
    typeof labels.has === 'function' &&
    (labels.has('ResetPool') ||
      labels.has('RetryableWriteError') ||
      labels.has('InterruptInUse'))
  ) {
    return true;
  }

  const name = e.name ?? '';
  const message = String(e.message ?? '');

  if (
    name === 'MongoNetworkError' ||
    name === 'MongoPoolClearedError' ||
    name === 'MongoServerSelectionError' ||
    name === 'MongoTopologyClosedError'
  ) {
    return true;
  }

  if (name === 'MongoBulkWriteError') {
    return (
      isRetryableMongoNetworkError(e.errorResponse) ||
      isRetryableMongoNetworkError(e.cause) ||
      /ECONNRESET|TLS connection|topology|pool cleared/i.test(message)
    );
  }

  return /ECONNRESET|before secure TLS|Topology is closed|pool cleared|socket disconnected/i.test(
    message
  );
}

export async function withMongoRetry<T>(
  fn: () => Promise<T>,
  options: {attempts?: number; baseDelayMs?: number} = {}
): Promise<T> {
  const attempts = options.attempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 150;
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const shouldRetry =
        isRetryableMongoNetworkError(err) && attempt < attempts - 1;
      if (!shouldRetry) {
        throw err;
      }
      await new Promise(resolve =>
        setTimeout(resolve, baseDelayMs * 2 ** attempt)
      );
    }
  }

  throw lastError;
}
