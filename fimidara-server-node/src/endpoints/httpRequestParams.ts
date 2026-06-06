import {Request} from 'express';
import {first, isString} from 'lodash-es';
import {convertToArray} from '../utils/fns.js';

export function getRequestQuery(req: Request): Record<string, unknown> {
  return (req.query ?? {}) as Record<string, unknown>;
}

/** Returns a header value when set; otherwise the matching query param. */
export function getHeaderOrQueryString(
  req: Request,
  headerName: string,
  queryKey: string
): string | string[] | undefined {
  const headerValue = req.headers[headerName];
  if (isString(headerValue) && headerValue) {
    return headerValue;
  }

  const queryValue = getRequestQuery(req)[queryKey];
  if (isString(queryValue) && queryValue) {
    return queryValue;
  }

  return headerValue;
}

export function parseTruthyHeaderOrQuery(
  req: Request,
  headerName: string,
  queryKey: string
): boolean {
  const headerValue = req.headers[headerName];
  if (headerValue === 'true' || headerValue === '1') {
    return true;
  }

  const queryValue = getRequestQuery(req)[queryKey];
  return queryValue === 'true' || queryValue === '1';
}

export function parseHeaderOrQueryInt(
  req: Request,
  headerName: string,
  queryKey: string
): number {
  const raw = getHeaderOrQueryString(req, headerName, queryKey);
  const value = isString(raw)
    ? raw
    : first(convertToArray(raw).filter(isString));
  return parseInt(value as string);
}
