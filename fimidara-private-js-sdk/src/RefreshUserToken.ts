import {noop} from 'lodash-es';
import type {IRefreshAuthToken} from 'mfdoc-js-sdk-base';
import {RefreshableResource} from 'softkave-js-utils';
import {kDefaultRefreshTokenTimeoutLatency} from './constants.js';
import type {FimidaraEndpoints} from './endpoints/privateEndpoints.js';
import type {LoginResult} from './endpoints/privateTypes.js';

function getRefreshDelayMs(
  jwtTokenExpiresAt: number,
  timeoutLatency: number
): number {
  return Math.max(0, jwtTokenExpiresAt - Date.now() - timeoutLatency);
}

export class RefreshUserToken
  extends RefreshableResource<LoginResult>
  implements IRefreshAuthToken
{
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
        const response = await props.endpoints.users.refreshToken(
          {refreshToken: current.refreshToken},
          {authToken: current.jwtToken},
        );

        return response;
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
