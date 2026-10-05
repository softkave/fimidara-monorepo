import { toast } from "@/hooks/use-toast.ts";
import { isArray, isFunction, isString } from "lodash-es";
import { useCallback, useMemo } from "react";
import { AnyFn, AnyObject, OrArray, convertToArray } from "softkave-js-utils";
import { Arguments, useSWRConfig } from "swr";
import {
  getUserFacingErrorMessage,
  kDefaultUserFacingErrorMessage,
  kErrorNamesList,
  OwnError,
} from "../common/error";
import { fimidxConsoleLogger } from "../common/logger";

async function readResponseJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch (error) {
    fimidxConsoleLogger.error(error);
    throw new OwnError(kDefaultUserFacingErrorMessage);
  }
}

export async function handleResponseError(res: Response) {
  if (res.status !== 200) {
    const json = (await readResponseJson(res)) as AnyObject;
    // TODO: map server zod errors to fields, and other error fields
    let errorMessage = isString(json?.message) ? json.message : "Unknown error";
    if (
      !isString(json?.name) ||
      !(kErrorNamesList as readonly string[]).includes(json.name)
    ) {
      errorMessage = kDefaultUserFacingErrorMessage;
      fimidxConsoleLogger.error(json);
    }
    throw new OwnError(errorMessage);
  }
}

export async function handleResponseSuccess<T>(res: Response) {
  const json = await readResponseJson(res);
  return json as T;
}

export async function handleResponse<T>(res: Response) {
  await handleResponseError(res);
  return handleResponseSuccess<T>(res);
}

export interface IUseMutationHandlerOpts<TFn extends AnyFn = AnyFn> {
  onSuccess?: OrArray<
    AnyFn<[params: Parameters<TFn>, res: Awaited<ReturnType<TFn>>], void>
  >;
  onError?: OrArray<AnyFn<[error: unknown, params: Parameters<TFn>], void>>;
  onFinally?: OrArray<AnyFn<[params: Parameters<TFn>], void>>;
  invalidate?: OrArray<
    string | RegExp | AnyFn<[Arguments, params: Parameters<TFn>], boolean>
  >;
  showToast?: boolean;
}

export function useMutationHandler<TFn extends AnyFn>(
  trigger: TFn,
  opts: IUseMutationHandlerOpts<TFn> = {}
) {
  const showToast = opts.showToast ?? true;
  const { mutate } = useSWRConfig();
  const invalidateFn = useCallback(
    (params: Parameters<TFn>) => {
      const invalidateList = convertToArray(opts.invalidate);
      if (invalidateList.length === 0) return;

      mutate((key) => {
        return invalidateList.some((invalidate) => {
          if (isFunction(invalidate)) return invalidate(key, params);
          if (isString(invalidate) && key) {
            if (isString(key)) return key.includes(invalidate);
            if (isArray(key))
              return key.some((k) => isString(k) && k.includes(invalidate));
          }
          if (invalidate instanceof RegExp) {
            if (isString(key)) return invalidate.test(key);
            if (isArray(key)) return key.some((k) => invalidate.test(k));
          }
          return false;
        });
      });
    },
    [mutate, opts.invalidate]
  );

  const onSuccess = useMemo(() => {
    return convertToArray(opts.onSuccess).concat(invalidateFn);
  }, [opts.onSuccess, invalidateFn]);

  return useCallback(
    async (...args: Parameters<TFn>): Promise<Awaited<ReturnType<TFn>>> => {
      try {
        const res = await trigger(...args);
        onSuccess.forEach((fn) => fn?.(args, res));
        return res;
      } catch (error) {
        fimidxConsoleLogger.error(error);
        convertToArray(opts.onError)?.forEach((fn) => fn?.(error, args));
        if (showToast) {
          toast({
            title: "Error occurred",
            description: getUserFacingErrorMessage(error),
          });
        }

        throw error;
      } finally {
        convertToArray(opts.onFinally)?.forEach((fn) => fn?.(args));
      }
    },
    [trigger, onSuccess, opts.onError, opts.onFinally, showToast]
  );
}
