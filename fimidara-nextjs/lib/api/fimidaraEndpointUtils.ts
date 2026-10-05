import { MfdocEndpointError as FimidaraEndpointError } from "fimidara";
import { isMfdocEndpointError } from "../common/error";

export function isFimidaraEndpointError(
  error: unknown
): error is FimidaraEndpointError {
  return isMfdocEndpointError(error);
}
