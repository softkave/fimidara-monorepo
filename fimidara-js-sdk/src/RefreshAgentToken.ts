import assert from 'assert';
import {noop} from 'lodash-es';
import {IRefreshAuthToken} from 'mfdoc-js-sdk-base';
import {RefreshableResource} from 'softkave-js-utils';
import {kDefaultRefreshTokenTimeoutLatency} from './constants.js';
import type {FimidaraEndpoints} from './endpoints/publicEndpoints.js';
import type {AgentToken} from './endpoints/publicTypes.js';

/**
 * Essential token properties required for refreshing agent authentication.
 * Contains the JWT token, refresh token, and expiration timestamp.
 */
export type RefreshAgentTokenValue = Pick<
  AgentToken,
  'jwtTokenExpiresAt' | 'jwtToken' | 'refreshToken'
>;

/**
 * Manages automatic refresh of agent authentication tokens.
 * Extends RefreshableResource to handle token lifecycle and implements IRefreshAuthToken interface.
 * Automatically refreshes tokens before they expire using the provided refresh token.
 */
export class RefreshAgentToken
  extends RefreshableResource<RefreshAgentTokenValue>
  implements IRefreshAuthToken
{
  constructor(props: {
    token: RefreshAgentTokenValue;
    endpoints: FimidaraEndpoints;
    timeoutLatency?: number;
    onError?: (error: unknown, current: RefreshAgentTokenValue) => void;
  }) {
    const timeoutLatency =
      props.timeoutLatency ?? kDefaultRefreshTokenTimeoutLatency;
    const getRefreshDelayMs = (jwtTokenExpiresAt?: number) =>
      jwtTokenExpiresAt
        ? Math.max(0, jwtTokenExpiresAt - Date.now() - timeoutLatency)
        : 0;

    super({
      timeout: getRefreshDelayMs(props.token.jwtTokenExpiresAt),
      resource: props.token,
      refreshFn: async current => {
        assert.ok(current.refreshToken, 'No refresh token provided');

        const response = await props.endpoints.agentTokens.refreshToken(
          {refreshToken: current.refreshToken},
          {authToken: current.jwtToken}
        );

        return response;
      },
      onRefresh: resource => {
        this.setRefreshTimeout(
          getRefreshDelayMs(resource.jwtTokenExpiresAt)
        ).start();
      },
      onError: (error, current) => {
        this.stop();
        (props.onError ?? noop)(error, current);
      },
    });
  }

  /**
   * Starts the automatic token refresh process.
   * Only starts if a valid timeout is set (i.e., token has expiration).
   * @returns This instance for method chaining
   */
  public start() {
    if (this.timeout) {
      return super.start();
    }

    return this;
  }

  /**
   * Gets the current JWT bearer token for authentication.
   * @returns The current JWT token string
   */
  public getBearerToken() {
    return this.getValue().jwtToken;
  }
}
