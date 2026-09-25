import { isEqual, isFunction } from "lodash-es";
import { AnyFn } from "softkave-js-utils";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { FetchResourceStore, FetchState } from "./types.ts";

export function makeFetchResourceStoreHook<TData, TReturnedData, TKeyParams>(
  storeName: string,
  getFn: AnyFn<[TKeyParams, FetchState<TData>], TReturnedData>,
  comparisonFn: AnyFn<[TKeyParams, TKeyParams], boolean> = isEqual
) {
  return create<
    FetchResourceStore<TData, TReturnedData, TKeyParams>,
    [["zustand/devtools", {}]]
  >(
    devtools(
      (set, get) => ({
        states: [] as Array<[TKeyParams, FetchState<TData>]>,
        getFetchState(params) {
          const store = get();
          const entry = store.states.find(([entryParams]) =>
            comparisonFn(params, entryParams)
          );

          if (entry) {
            const fetchState = entry[1];
            const data = getFn(params, fetchState);

            return {
              data,
              error: fetchState.error,
              loading: fetchState.loading,
            };
          }

          return undefined;
        },

        clear(params) {
          set((store) => {
            if (params) {
              const states = store.states.filter(([entryParams]) => {
                const matched = comparisonFn(params, entryParams);
                return !matched;
              });
              return { states };
            } else {
              return { states: [] };
            }
          });
        },

        setFetchState(params, update, initialize = true) {
          set((store) => {
            const index = store.states.findIndex(([entryParams]) =>
              comparisonFn(params, entryParams)
            );
            let states = [...store.states];
            const entryData = isFunction(update)
              ? update(index >= 0 ? states[index][1] : undefined)
              : update;

            if (index !== -1) {
              states[index] = [params, entryData];
            } else if (initialize) {
              states.push([params, entryData]);
            }

            return { states };
          });
        },

        findFetchState(fn) {
          return get().states.find(([params, state]) => fn(params, state));
        },

        mapFetchState(fn) {
          set((store) => {
            const states: Array<[TKeyParams, FetchState<TData>]> =
              store.states.map(([params, fetchState]) => [
                params,
                fn(params, fetchState),
              ]);
            return { states };
          });
        },
      }),
      { name: storeName }
    )
  );
}

type MakeFetchResourceStoreHookFn<TData, TReturnedData, TKeyParams> =
  typeof makeFetchResourceStoreHook<TData, TReturnedData, TKeyParams>;
export type FetchResourceZustandStore<TData, TReturnedData, TKeyParams> =
  ReturnType<MakeFetchResourceStoreHookFn<TData, TReturnedData, TKeyParams>>;
