import assert from 'assert';
import {isArray, isFunction, isObject, isUndefined} from 'lodash-es';
import {format} from 'util';
import {AnyFn} from '../../../utils/types.js';

export function assertErrorHasName(
  error: unknown,
  expectedErrorNames: string[]
) {
  const errorList = isArray(error) ? error : [error];
  const matchedTypes = expectedErrorNames.map(name =>
    errorList.find(item => item?.name === name)
  );
  const missingTypes: string[] = [];
  expectedErrorNames.forEach((name, i) => {
    if (!matchedTypes[i]) {
      missingTypes.push(name);
    }
  });

  const missingError = new Error(
    `${missingTypes.join(', ')} not found in \n${format(error)}`
  );

  assert.ok(missingTypes.length === 0, missingError);
}

export async function expectErrorThrown(
  fn: AnyFn,
  expected?: string[] | AnyFn<[unknown], Error | boolean | void>,
  finallyFn?: AnyFn
) {
  try {
    await fn();
    assert.fail('Error not thrown');
  } catch (error) {
    if (isFunction(expected)) {
      const assertionResult = expected(error);

      if (!isUndefined(assertionResult)) {
        assert.ok(
          assertionResult,
          isObject(assertionResult) ? assertionResult : 'Expectation not met'
        );
      }
    } else if (expected) {
      assertErrorHasName(error, expected);
    }
  } finally {
    if (finallyFn) {
      finallyFn();
    }
  }
}

/**
 * Creates a setup/teardown helper for ignoring expected unhandled promise rejections
 * in tests. This is useful when errors are thrown in background queue processing
 * and are expected behavior (e.g., concurrent uploads causing FileNotWritableError).
 *
 * @param errorMatcher - One or more error classes/constructors to match, or a function
 *                       that returns true if the error should be ignored
 * @returns An object with `beforeAll` and `afterAll` hooks to set up and tear down
 *          the unhandled rejection handler
 *
 * @example
 * ```ts
 * const {beforeAll: beforeAllIgnoreErrors, afterAll: afterAllIgnoreErrors} =
 *   setupIgnoreUnhandledRejections(FileNotWritableError);
 *
 * beforeAll(beforeAllIgnoreErrors);
 * afterAll(afterAllIgnoreErrors);
 * ```
 *
 * @example
 * ```ts
 * const {beforeAll: beforeAllIgnoreErrors, afterAll: afterAllIgnoreErrors} =
 *   setupIgnoreUnhandledRejections([NotFoundError, FileNotWritableError]);
 *
 * beforeAll(beforeAllIgnoreErrors);
 * afterAll(afterAllIgnoreErrors);
 * ```
 */
export function setupIgnoreUnhandledRejections(
  errorMatcher:
    | (new (...args: any[]) => Error)
    | Array<new (...args: any[]) => Error>
    | ((reason: unknown) => boolean)
): {
  beforeAll: () => void;
  afterAll: () => void;
} {
  let unhandledRejectionHandler: ((reason: unknown) => void) | undefined;

  const beforeAllHook = () => {
    unhandledRejectionHandler = (reason: unknown) => {
      let shouldIgnore = false;

      if (isArray(errorMatcher)) {
        // Multiple error classes
        shouldIgnore = errorMatcher.some(
          ErrorClass => reason instanceof ErrorClass
        );
      } else if (isFunction(errorMatcher)) {
        // Check if it's a class constructor by inspecting its string representation
        // ES6 classes have toString() that starts with "class "
        const isClassConstructor = errorMatcher
          .toString()
          .trim()
          .startsWith('class ');

        if (isClassConstructor) {
          // It's a class constructor, use instanceof
          shouldIgnore = reason instanceof (errorMatcher as any);
        } else {
          // It's a plain function, use it as a custom matcher
          shouldIgnore = errorMatcher(reason);
        }
      } else {
        // Fallback: treat as error class (shouldn't happen with proper typing)
        shouldIgnore = reason instanceof (errorMatcher as any);
      }

      if (shouldIgnore) {
        // Silently ignore expected errors
        // This prevents Vitest from reporting them as unhandled rejections
        return;
      }
      // For other errors, we don't handle them here, so they'll still be reported by Vitest
    };

    // Use prependListener so our handler runs before Vitest's handler
    // This allows us to filter out expected errors while preserving Vitest's error tracking
    process.prependListener('unhandledRejection', unhandledRejectionHandler);
  };

  const afterAllHook = () => {
    if (unhandledRejectionHandler) {
      process.removeListener('unhandledRejection', unhandledRejectionHandler);
      unhandledRejectionHandler = undefined;
    }
  };

  return {
    beforeAll: beforeAllHook,
    afterAll: afterAllHook,
  };
}
