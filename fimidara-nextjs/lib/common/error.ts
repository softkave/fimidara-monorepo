import { isObject } from "lodash-es";
import { AnyObject } from "softkave-js-utils";

export const kOwnError = Symbol("OwnError");
export const kOwnServerError = Symbol("OwnServerError");

export class OwnError extends Error {
  static isOwnError(error: unknown): error is OwnError {
    return isObject(error) && (error as AnyObject)[kOwnError] === true;
  }

  [kOwnError]: true = true as const;

  constructor(message: string) {
    super(message);
  }
}

export class OwnServerError extends OwnError {
  static isOwnServerError(error: unknown): error is OwnServerError {
    return (
      OwnError.isOwnError(error) &&
      (error as AnyObject)[kOwnServerError] === true
    );
  }

  [kOwnServerError]: true = true as const;
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const kErrorNames = {
  OwnError: "OwnError",
  OwnServerError: "OwnServerError",
  ZodError: "ZodError",
  AssertionError: "AssertionError",
  UnknownError: "UnknownError",
} as const;

export const kErrorNamesList = Object.values(kErrorNames);

export const kDefaultUserFacingErrorMessage =
  "An error occurred. Please try again later.";

/** Duck-type check for mfdoc/fimidara SDK endpoint errors. */
export function isMfdocEndpointError(
  error: unknown
): error is Error & { isMfdocEndpointError: true } {
  return (
    isObject(error) &&
    (error as AnyObject).isMfdocEndpointError === true &&
    typeof (error as Error).message === "string"
  );
}

/**
 * OwnError and MfdocEndpointError messages are safe to show in the UI.
 * Other errors fall back to a generic message.
 */
export function getUserFacingErrorMessage(
  error: unknown,
  fallback = kDefaultUserFacingErrorMessage
): string {
  if (OwnError.isOwnError(error) && error.message) {
    return error.message;
  }
  if (isMfdocEndpointError(error) && error.message) {
    return error.message;
  }
  return fallback;
}
