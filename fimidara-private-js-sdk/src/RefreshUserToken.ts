import {noop} from 'lodash-es';
import type {IRefreshAuthToken} from 'mfdoc-js-sdk-base';
import {RefreshableResource} from 'softkave-js-utils';
import {kDefaultRefreshTokenTimeoutLatency} from './constants.js';
import type {FimidaraEndpoints} from './endpoints/privateEndpoints.js';
import type {LoginResult} from './endpoints/privateTypes.js';

/** setTimeout/setInterval store delays as 32-bit signed ints; larger values wrap
 * and fire immediately — which with a 30-day JWT becomes an infinite refresh loop. */
const kMaxTimerDelayMs = 2_147_483_647;

function getRefreshDelayMs(
  jwtTokenExpiresAt: number,
  timeoutLatency: number
): number {
  if (!Number.isFinite(jwtTokenExpiresAt)) {
    return 0;
  }

  const delay = jwtTokenExpiresAt - Date.now() - timeoutLatency;
  if (!Number.isFinite(delay) || delay <= 0) {
    return 0;
  }

  return Math.min(delay, kMaxTimerDelayMs);
}

export class RefreshUserToken
  extends RefreshableResource<LoginResult>
  implements IRefreshAuthToken
{
  #isRefreshing = false;

  constructor(props: {
    user: LoginResult;
    endpoints: FimidaraEndpoints;
    timeoutLatency?: number;
    onError?: (error: unknown, current: LoginResult) => void;
  }) {
    const timeoutLatency =
      props.timeoutLatency ?? kDefaultRefreshTokenTimeoutLatency;

    super({
      timeout: getRefreshDelayMs(props.user.jwtTokenExpiresAt, timeoutLatency),
      resource: props.user,
      refreshFn: async current => {
        if (this.#isRefreshing) {
          return current;
        }

        this.#isRefreshing = true;
        try {
          return await props.endpoints.users.refreshToken(
            {refreshToken: current.refreshToken},
            {authToken: current.jwtToken},
          );
        } finally {
          this.#isRefreshing = false;
        }
      },
      onRefresh: resource => {
        this.setRefreshTimeout(
          getRefreshDelayMs(resource.jwtTokenExpiresAt, timeoutLatency),
        ).start();
      },
      onError: (error, current) => {
        this.stop();
        (props.onError ?? noop)(error, current);
      },
    });
  }

  public start() {
    if (this.timeout) {
      return super.start();
    }

    return this;
  }

  public getBearerToken() {
    return this.getValue().jwtToken;
  }
}
