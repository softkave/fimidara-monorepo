import { callSetCookieEndpoint } from "@/lib/api/account/index.ts";
import { getPrivateFimidaraEndpoints } from "@/lib/api/fimidaraEndpoints.ts";
import { fimidxConsoleLogger } from "@/lib/common/logger/fimidx-console-logger.ts";
import { kUserSessionStorageFns } from "@/lib/storage/UserSessionStorageFns.ts";
import { LoginResult, RefreshUserToken } from "fimidara-private-js-sdk";
import { FetchSingleResourceData, FetchState } from "../fetchHooks/types.ts";
import {
  UserSessionFetchStoreOther,
  useUserSessionFetchStore,
} from "../fetchStores/session.ts";
import { useUsersStore } from "../resourceListStores.ts";

export function makeUpdateLocalLoginResultFn(params: {
  persistJwtToken: boolean;
}) {
  return (result: LoginResult) => {
    updateLocalLoginResult({
      result,
      persistJwtToken: params.persistJwtToken,
    });
  };
}

async function updateUserSessionFetchStore(params: {
  result: LoginResult;
  userId: string;
}) {
  const { result, userId } = params;
  const [state0] = useUserSessionFetchStore.getState().states;
  const [existingParams, existingState] = state0 ?? [];

  if (existingState?.data?.other?.refresh) {
    existingState.data.other.refresh.stop();
  }

  const newState: FetchState<
    FetchSingleResourceData<UserSessionFetchStoreOther>
  > = {
    loading: false,
    error: undefined,
    data: {
      id: userId,
      other: {
        session: result,
        refresh: new RefreshUserToken({
          endpoints: getPrivateFimidaraEndpoints({
            authToken: result.jwtToken,
          }),
          user: result,
        }),
      },
    },
  };

  useUserSessionFetchStore.setState({
    states: [[existingParams ?? {}, newState]],
  });
}

export function updateLocalLoginResult(params: {
  result: LoginResult;
  persistJwtToken: boolean;
}) {
  const { result, persistJwtToken } = params;
  const { user, clientJwtToken, jwtToken, jwtTokenExpiresAt, refreshToken } =
    result;

  const shouldPersistJwtToken =
    kUserSessionStorageFns.getData().jwtToken || persistJwtToken;

  if (shouldPersistJwtToken) {
    kUserSessionStorageFns.setData({
      clientJwtToken,
      jwtToken,
      jwtTokenExpiresAt,
      refreshToken,
    });

    callSetCookieEndpoint({
      arg: { jwtToken, userId: user.resourceId },
    }).catch(fimidxConsoleLogger.error.bind(fimidxConsoleLogger));
  }

  useUsersStore.getState().set(user.resourceId, user);
  updateUserSessionFetchStore({ result, userId: user.resourceId });
}
