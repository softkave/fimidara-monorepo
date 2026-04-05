import {
  MfdocHttpEndpointMethod as HttpEndpointMethod,
  InferMfdocFieldObjectOrMultipartType as InferFieldObjectOrMultipartType,
  InferMfdocFieldObjectType as InferFieldObjectType,
  mfdocConstruct,
} from 'mfdoc';
import { PublicAgentToken } from '../../definitions/agentToken.js';
import {
  fReusables,
  mfdocEndpointHttpHeaderItems,
  mfdocEndpointHttpResponseItems,
} from '../helpers.mfdoc.js';
import { kEndpointTag } from '../types.js';
import {
  AddAgentTokenEndpointParams,
  AddAgentTokenEndpointResult,
  NewAgentTokenInput,
} from './addToken/types.js';
import { kAgentTokenConstants } from './constants.js';
import { CountWorkspaceAgentTokensEndpointParams } from './countWorkspaceTokens/types.js';
import { DeleteAgentTokenEndpointParams } from './deleteToken/types.js';
import {
  EncodeAgentTokenEndpointParams,
  EncodeAgentTokenEndpointResult,
} from './encodeToken/types.js';
import {
  GetAgentTokenEndpointParams,
  GetAgentTokenEndpointResult,
} from './getToken/types.js';
import {
  GetWorkspaceAgentTokensEndpointParams,
  GetWorkspaceAgentTokensEndpointResult,
} from './getWorkspaceTokens/types.js';
import {
  RefreshAgentTokenEndpointParams,
  RefreshAgentTokenEndpointResult,
} from './refreshToken/types.js';
import {
  AddAgentTokenHttpEndpoint,
  CountWorkspaceAgentTokensHttpEndpoint,
  DeleteAgentTokenHttpEndpoint,
  EncodeAgentTokenHttpEndpoint,
  GetAgentTokenHttpEndpoint,
  GetWorkspaceAgentTokensHttpEndpoint,
  RefreshAgentTokenHttpEndpoint,
  UpdateAgentTokenHttpEndpoint,
} from './types.js';
import {
  UpdateAgentTokenEndpointParams,
  UpdateAgentTokenEndpointResult,
} from './updateToken/types.js';

const shouldRefresh = mfdocConstruct.constructBoolean({
  description: 'Whether the token should be refreshed.',
  example: true,
});
const shouldEncode = mfdocConstruct.constructBoolean({
  description:
    'Whether the token returned should include the token encoded in JWT format.',
  example: false,
});
const refreshDurationMs = mfdocConstruct.constructNumber({
  description:
    'The duration in milliseconds for which a generated JWT token, not the actual agent token, is valid.',
  example: 2592000000, // 30 days in milliseconds (30 * 24 * 60 * 60 * 1000)
});

const newAgentTokenInput = mfdocConstruct.constructObject<NewAgentTokenInput>({
  name: 'NewAgentTokenInput',
  description: 'Input data for creating a new agent token',
  fields: {
    name: mfdocConstruct.constructObjectField({
      required: false,
      data: fReusables.name,
    }),
    description: mfdocConstruct.constructObjectField({
      required: false,
      data: fReusables.description,
    }),
    expiresAt: mfdocConstruct.constructObjectField({
      required: false,
      data: fReusables.expires,
    }),
    providedResourceId: mfdocConstruct.constructObjectField({
      required: false,
      data: fReusables.providedResourceId,
    }),
    shouldRefresh: mfdocConstruct.constructObjectField({
      required: false,
      data: shouldRefresh,
    }),
    refreshDuration: mfdocConstruct.constructObjectField({
      required: false,
      data: refreshDurationMs,
    }),
  },
});

const agentToken = mfdocConstruct.constructObject<PublicAgentToken>({
  name: 'AgentToken',
  description: 'Agent token with authentication details and metadata',
  fields: {
    ...fReusables.workspaceResourceParts,
    name: mfdocConstruct.constructObjectField({
      required: false,
      data: fReusables.name,
    }),
    description: mfdocConstruct.constructObjectField({
      required: false,
      data: fReusables.description,
    }),
    jwtToken: mfdocConstruct.constructObjectField({
      required: false,
      data: fReusables.tokenString,
    }),
    refreshToken: mfdocConstruct.constructObjectField({
      required: false,
      data: fReusables.refreshTokenString,
    }),
    expiresAt: mfdocConstruct.constructObjectField({
      required: false,
      data: fReusables.expires,
    }),
    providedResourceId: mfdocConstruct.constructObjectField({
      required: false,
      data: fReusables.providedResourceIdOrNull,
    }),
    jwtTokenExpiresAt: mfdocConstruct.constructObjectField({
      required: false,
      data: fReusables.jwtTokenExpiresAt,
    }),
    shouldRefresh: mfdocConstruct.constructObjectField({
      required: false,
      data: shouldRefresh,
    }),
    refreshDuration: mfdocConstruct.constructObjectField({
      required: false,
      data: refreshDurationMs,
    }),
  },
});

const addAgentTokenParams =
  mfdocConstruct.constructObject<AddAgentTokenEndpointParams>({
    name: 'AddAgentTokenEndpointParams',
    description: 'Parameters for creating a new agent token',
    fields: {
      workspaceId: mfdocConstruct.constructObjectField({
        required: false,
        data: fReusables.workspaceId,
      }),
      name: mfdocConstruct.constructObjectField({
        required: false,
        data: fReusables.name,
      }),
      description: mfdocConstruct.constructObjectField({
        required: false,
        data: fReusables.description,
      }),
      expiresAt: mfdocConstruct.constructObjectField({
        required: false,
        data: fReusables.expires,
      }),
      providedResourceId: mfdocConstruct.constructObjectField({
        required: false,
        data: fReusables.providedResourceId,
      }),
      shouldEncode: mfdocConstruct.constructObjectField({
        required: false,
        data: shouldEncode,
      }),
      shouldRefresh: mfdocConstruct.constructObjectField({
        required: false,
        data: shouldRefresh,
      }),
      refreshDuration: mfdocConstruct.constructObjectField({
        required: false,
        data: refreshDurationMs,
      }),
    },
  });

const addAgentTokenSuccessResponseBody =
  mfdocConstruct.constructObject<AddAgentTokenEndpointResult>({
    name: 'AddAgentTokenEndpointResult',
    description: 'Response containing the newly created agent token',
    fields: {
      token: mfdocConstruct.constructObjectField({
        required: true,
        data: agentToken,
      }),
    },
  });

const getWorkspaceAgentTokensParams =
  mfdocConstruct.constructObject<GetWorkspaceAgentTokensEndpointParams>({
    name: 'GetWorkspaceAgentTokensEndpointParams',
    description: 'Parameters for retrieving agent tokens in a workspace',
    fields: {
      workspaceId: mfdocConstruct.constructObjectField({
        required: false,
        data: fReusables.workspaceIdInput,
      }),
      page: mfdocConstruct.constructObjectField({
        required: false,
        data: fReusables.page,
      }),
      pageSize: mfdocConstruct.constructObjectField({
        required: false,
        data: fReusables.pageSize,
      }),
      shouldEncode: mfdocConstruct.constructObjectField({
        required: false,
        data: shouldEncode,
      }),
    },
  });

const getWorkspaceAgentTokensSuccessResponseBody =
  mfdocConstruct.constructObject<GetWorkspaceAgentTokensEndpointResult>({
    name: 'GetWorkspaceAgentTokensEndpointResult',
    description: 'Paginated list of agent tokens in the workspace',
    fields: {
      tokens: mfdocConstruct.constructObjectField({
        required: true,
        data: mfdocConstruct.constructArray<PublicAgentToken>({
          type: agentToken,
          description: 'List of agent tokens',
        }),
      }),
      page: mfdocConstruct.constructObjectField({
        required: true,
        data: fReusables.page,
      }),
    },
  });

const countWorkspaceAgentTokensParams =
  mfdocConstruct.constructObject<CountWorkspaceAgentTokensEndpointParams>({
    name: 'CountWorkspaceAgentTokensEndpointParams',
    description: 'Parameters for counting agent tokens in a workspace',
    fields: {
      workspaceId: mfdocConstruct.constructObjectField({
        required: false,
        data: fReusables.workspaceIdInput,
      }),
    },
  });

const updateAgentTokenParams =
  mfdocConstruct.constructObject<UpdateAgentTokenEndpointParams>({
    name: 'UpdateAgentTokenEndpointParams',
    description: 'Parameters for updating an existing agent token',
    fields: {
      workspaceId: mfdocConstruct.constructObjectField({
        required: false,
        data: fReusables.workspaceIdInput,
      }),
      tokenId: mfdocConstruct.constructObjectField({
        required: false,
        data: fReusables.id,
      }),
      onReferenced: mfdocConstruct.constructObjectField({
        required: false,
        data: fReusables.effectOnReferenced,
      }),
      token: mfdocConstruct.constructObjectField({
        required: true,
        data: newAgentTokenInput,
      }),
      providedResourceId: mfdocConstruct.constructObjectField({
        required: false,
        data: fReusables.providedResourceId,
      }),
      shouldEncode: mfdocConstruct.constructObjectField({
        required: false,
        data: shouldEncode,
      }),
    },
  });

const updateAgentTokenSuccessResponseBody =
  mfdocConstruct.constructObject<UpdateAgentTokenEndpointResult>({
    name: 'UpdateAgentTokenEndpointResult',
    description: 'Response containing the updated agent token',
    fields: {
      token: mfdocConstruct.constructObjectField({
        required: true,
        data: agentToken,
      }),
    },
  });

const getAgentTokenParams =
  mfdocConstruct.constructObject<GetAgentTokenEndpointParams>({
    name: 'GetAgentTokenEndpointParams',
    description: 'Parameters for retrieving a specific agent token',
    fields: {
      workspaceId: mfdocConstruct.constructObjectField({
        required: false,
        data: fReusables.workspaceIdInput,
      }),
      providedResourceId: mfdocConstruct.constructObjectField({
        required: false,
        data: fReusables.providedResourceId,
      }),
      tokenId: mfdocConstruct.constructObjectField({
        required: false,
        data: fReusables.id,
      }),
      onReferenced: mfdocConstruct.constructObjectField({
        required: false,
        data: fReusables.effectOnReferenced,
      }),
      shouldEncode: mfdocConstruct.constructObjectField({
        required: false,
        data: shouldEncode,
      }),
    },
  });

const getAgentTokenSuccessBody =
  mfdocConstruct.constructObject<GetAgentTokenEndpointResult>({
    name: 'GetAgentTokenEndpointResult',
    description: 'Response containing the requested agent token',
    fields: {
      token: mfdocConstruct.constructObjectField({
        required: true,
        data: agentToken,
      }),
    },
  });

const deleteAgentTokenParams =
  mfdocConstruct.constructObject<DeleteAgentTokenEndpointParams>({
    name: 'DeleteAgentTokenEndpointParams',
    description: 'Parameters for deleting an agent token',
    fields: {
      tokenId: mfdocConstruct.constructObjectField({
        required: false,
        data: fReusables.id,
      }),
      onReferenced: mfdocConstruct.constructObjectField({
        required: false,
        data: fReusables.effectOnReferenced,
      }),
      providedResourceId: mfdocConstruct.constructObjectField({
        required: false,
        data: fReusables.providedResourceId,
      }),
      workspaceId: mfdocConstruct.constructObjectField({
        required: false,
        data: fReusables.workspaceIdInput,
      }),
    },
  });

const refreshAgentTokenParams =
  mfdocConstruct.constructObject<RefreshAgentTokenEndpointParams>({
    name: 'RefreshAgentTokenEndpointParams',
    description: 'Parameters for refreshing an agent token to get a new JWT',
    fields: {
      refreshToken: mfdocConstruct.constructObjectField({
        required: true,
        data: fReusables.refreshTokenString,
      }),
    },
  });

const refreshAgentTokenSuccessResponseBody =
  mfdocConstruct.constructObject<RefreshAgentTokenEndpointResult>({
    name: 'RefreshAgentTokenEndpointResult',
    description: 'Response containing refreshed JWT token details',
    fields: {
      jwtToken: mfdocConstruct.constructObjectField({
        required: true,
        data: fReusables.tokenString,
      }),
      refreshToken: mfdocConstruct.constructObjectField({
        required: false,
        data: fReusables.refreshTokenString,
      }),
      jwtTokenExpiresAt: mfdocConstruct.constructObjectField({
        required: false,
        data: fReusables.jwtTokenExpiresAt,
      }),
    },
  });

const encodeAgentTokenParams =
  mfdocConstruct.constructObject<EncodeAgentTokenEndpointParams>({
    name: 'EncodeAgentTokenEndpointParams',
    description: 'Parameters for encoding an agent token into JWT format',
    fields: {
      workspaceId: mfdocConstruct.constructObjectField({
        required: false,
        data: fReusables.workspaceIdInput,
      }),
      providedResourceId: mfdocConstruct.constructObjectField({
        required: false,
        data: fReusables.providedResourceId,
      }),
      tokenId: mfdocConstruct.constructObjectField({
        required: false,
        data: fReusables.id,
      }),
      onReferenced: mfdocConstruct.constructObjectField({
        required: false,
        data: fReusables.effectOnReferenced,
      }),
    },
  });

const encodeAgentTokenSuccessResponseBody =
  mfdocConstruct.constructObject<EncodeAgentTokenEndpointResult>({
    name: 'EncodeAgentTokenEndpointResult',
    description: 'Response containing the encoded JWT token',
    fields: {
      jwtToken: mfdocConstruct.constructObjectField({
        required: true,
        data: fReusables.tokenString,
      }),
      refreshToken: mfdocConstruct.constructObjectField({
        required: false,
        data: fReusables.refreshTokenString,
      }),
      jwtTokenExpiresAt: mfdocConstruct.constructObjectField({
        required: false,
        data: fReusables.jwtTokenExpiresAt,
      }),
    },
  });

export const addAgentTokenEndpointDefinition =
  mfdocConstruct.constructHttpEndpointDefinition<
    InferFieldObjectType<
      AddAgentTokenHttpEndpoint['mfdocHttpDefinition']['requestHeaders']
    >,
    InferFieldObjectType<
      AddAgentTokenHttpEndpoint['mfdocHttpDefinition']['pathParamaters']
    >,
    InferFieldObjectType<
      AddAgentTokenHttpEndpoint['mfdocHttpDefinition']['query']
    >,
    InferFieldObjectOrMultipartType<
      AddAgentTokenHttpEndpoint['mfdocHttpDefinition']['requestBody']
    >,
    InferFieldObjectType<
      AddAgentTokenHttpEndpoint['mfdocHttpDefinition']['responseHeaders']
    >,
    InferFieldObjectType<
      AddAgentTokenHttpEndpoint['mfdocHttpDefinition']['responseBody']
    >
  >({
    path: kAgentTokenConstants.routes.addToken,
    method: HttpEndpointMethod.Post,
    requestBody: addAgentTokenParams,
    requestHeaders:
      mfdocEndpointHttpHeaderItems.requestHeaders_AuthRequired_JsonContentType,
    responseBody: addAgentTokenSuccessResponseBody,
    responseHeaders:
      mfdocEndpointHttpHeaderItems.responseHeaders_JsonContentType,
    tags: [kEndpointTag.public],
    name: 'fimidara/agentTokens/addToken',
    description:
      'Create a new agent token for API authentication. Agent tokens allow external applications and services to authenticate with the fimidara API.',
  });

export const getAgentTokenEndpointDefinition =
  mfdocConstruct.constructHttpEndpointDefinition<
    InferFieldObjectType<
      GetAgentTokenHttpEndpoint['mfdocHttpDefinition']['requestHeaders']
    >,
    InferFieldObjectType<
      GetAgentTokenHttpEndpoint['mfdocHttpDefinition']['pathParamaters']
    >,
    InferFieldObjectType<
      GetAgentTokenHttpEndpoint['mfdocHttpDefinition']['query']
    >,
    InferFieldObjectOrMultipartType<
      GetAgentTokenHttpEndpoint['mfdocHttpDefinition']['requestBody']
    >,
    InferFieldObjectType<
      GetAgentTokenHttpEndpoint['mfdocHttpDefinition']['responseHeaders']
    >,
    InferFieldObjectType<
      GetAgentTokenHttpEndpoint['mfdocHttpDefinition']['responseBody']
    >
  >({
    path: kAgentTokenConstants.routes.getToken,
    method: HttpEndpointMethod.Post,
    requestBody: getAgentTokenParams,
    requestHeaders:
      mfdocEndpointHttpHeaderItems.requestHeaders_AuthRequired_JsonContentType,
    responseHeaders:
      mfdocEndpointHttpHeaderItems.responseHeaders_JsonContentType,
    responseBody: getAgentTokenSuccessBody,
    tags: [kEndpointTag.public],
    name: 'fimidara/agentTokens/getToken',
    description:
      'Retrieve a specific agent token by ID or provided resource ID. Use this to get token details and check token status.',
  });

export const updateAgentTokenEndpointDefinition =
  mfdocConstruct.constructHttpEndpointDefinition<
    InferFieldObjectType<
      UpdateAgentTokenHttpEndpoint['mfdocHttpDefinition']['requestHeaders']
    >,
    InferFieldObjectType<
      UpdateAgentTokenHttpEndpoint['mfdocHttpDefinition']['pathParamaters']
    >,
    InferFieldObjectType<
      UpdateAgentTokenHttpEndpoint['mfdocHttpDefinition']['query']
    >,
    InferFieldObjectOrMultipartType<
      UpdateAgentTokenHttpEndpoint['mfdocHttpDefinition']['requestBody']
    >,
    InferFieldObjectType<
      UpdateAgentTokenHttpEndpoint['mfdocHttpDefinition']['responseHeaders']
    >,
    InferFieldObjectType<
      UpdateAgentTokenHttpEndpoint['mfdocHttpDefinition']['responseBody']
    >
  >({
    path: kAgentTokenConstants.routes.updateToken,
    method: HttpEndpointMethod.Post,
    requestBody: updateAgentTokenParams,
    requestHeaders:
      mfdocEndpointHttpHeaderItems.requestHeaders_AuthRequired_JsonContentType,
    responseHeaders:
      mfdocEndpointHttpHeaderItems.responseHeaders_JsonContentType,
    responseBody: updateAgentTokenSuccessResponseBody,
    tags: [kEndpointTag.public],
    name: 'fimidara/agentTokens/updateToken',
    description:
      "Update an existing agent token's properties such as name, description, or expiration date.",
  });

export const deleteAgentTokenEndpointDefinition =
  mfdocConstruct.constructHttpEndpointDefinition<
    InferFieldObjectType<
      DeleteAgentTokenHttpEndpoint['mfdocHttpDefinition']['requestHeaders']
    >,
    InferFieldObjectType<
      DeleteAgentTokenHttpEndpoint['mfdocHttpDefinition']['pathParamaters']
    >,
    InferFieldObjectType<
      DeleteAgentTokenHttpEndpoint['mfdocHttpDefinition']['query']
    >,
    InferFieldObjectOrMultipartType<
      DeleteAgentTokenHttpEndpoint['mfdocHttpDefinition']['requestBody']
    >,
    InferFieldObjectType<
      DeleteAgentTokenHttpEndpoint['mfdocHttpDefinition']['responseHeaders']
    >,
    InferFieldObjectType<
      DeleteAgentTokenHttpEndpoint['mfdocHttpDefinition']['responseBody']
    >
  >({
    path: kAgentTokenConstants.routes.deleteToken,
    method: HttpEndpointMethod.Delete,
    requestBody: deleteAgentTokenParams,
    requestHeaders:
      mfdocEndpointHttpHeaderItems.requestHeaders_AuthRequired_JsonContentType,
    responseHeaders:
      mfdocEndpointHttpHeaderItems.responseHeaders_JsonContentType,
    responseBody: mfdocEndpointHttpResponseItems.longRunningJobResponseBody,
    tags: [kEndpointTag.public],
    name: 'fimidara/agentTokens/deleteToken',
    description:
      'Delete an agent token. This will revoke the token and prevent it from being used for authentication. This action cannot be undone.',
  });

export const getWorkspaceAgentTokensEndpointDefinition =
  mfdocConstruct.constructHttpEndpointDefinition<
    InferFieldObjectType<
      GetWorkspaceAgentTokensHttpEndpoint['mfdocHttpDefinition']['requestHeaders']
    >,
    InferFieldObjectType<
      GetWorkspaceAgentTokensHttpEndpoint['mfdocHttpDefinition']['pathParamaters']
    >,
    InferFieldObjectType<
      GetWorkspaceAgentTokensHttpEndpoint['mfdocHttpDefinition']['query']
    >,
    InferFieldObjectOrMultipartType<
      GetWorkspaceAgentTokensHttpEndpoint['mfdocHttpDefinition']['requestBody']
    >,
    InferFieldObjectType<
      GetWorkspaceAgentTokensHttpEndpoint['mfdocHttpDefinition']['responseHeaders']
    >,
    InferFieldObjectType<
      GetWorkspaceAgentTokensHttpEndpoint['mfdocHttpDefinition']['responseBody']
    >
  >({
    path: kAgentTokenConstants.routes.getWorkspaceTokens,
    method: HttpEndpointMethod.Post,
    requestBody: getWorkspaceAgentTokensParams,
    requestHeaders:
      mfdocEndpointHttpHeaderItems.requestHeaders_AuthRequired_JsonContentType,
    responseHeaders:
      mfdocEndpointHttpHeaderItems.responseHeaders_JsonContentType,
    responseBody: getWorkspaceAgentTokensSuccessResponseBody,
    tags: [kEndpointTag.public],
    name: 'fimidara/agentTokens/getWorkspaceTokens',
    description:
      'Retrieve all agent tokens in a workspace with pagination support. Use this to list and manage multiple tokens.',
  });

export const countWorkspaceAgentTokensEndpointDefinition =
  mfdocConstruct.constructHttpEndpointDefinition<
    InferFieldObjectType<
      CountWorkspaceAgentTokensHttpEndpoint['mfdocHttpDefinition']['requestHeaders']
    >,
    InferFieldObjectType<
      CountWorkspaceAgentTokensHttpEndpoint['mfdocHttpDefinition']['pathParamaters']
    >,
    InferFieldObjectType<
      CountWorkspaceAgentTokensHttpEndpoint['mfdocHttpDefinition']['query']
    >,
    InferFieldObjectOrMultipartType<
      CountWorkspaceAgentTokensHttpEndpoint['mfdocHttpDefinition']['requestBody']
    >,
    InferFieldObjectType<
      CountWorkspaceAgentTokensHttpEndpoint['mfdocHttpDefinition']['responseHeaders']
    >,
    InferFieldObjectType<
      CountWorkspaceAgentTokensHttpEndpoint['mfdocHttpDefinition']['responseBody']
    >
  >({
    path: kAgentTokenConstants.routes.countWorkspaceTokens,
    method: HttpEndpointMethod.Post,
    requestBody: countWorkspaceAgentTokensParams,
    requestHeaders:
      mfdocEndpointHttpHeaderItems.requestHeaders_AuthRequired_JsonContentType,
    responseHeaders:
      mfdocEndpointHttpHeaderItems.responseHeaders_JsonContentType,
    responseBody: mfdocEndpointHttpResponseItems.countResponseBody,
    tags: [kEndpointTag.public],
    name: 'fimidara/agentTokens/countWorkspaceTokens',
    description:
      'Get the total count of agent tokens in a workspace. Useful for pagination calculations and resource management.',
  });

export const refreshAgentTokenEndpointDefinition =
  mfdocConstruct.constructHttpEndpointDefinition<
    InferFieldObjectType<
      RefreshAgentTokenHttpEndpoint['mfdocHttpDefinition']['requestHeaders']
    >,
    InferFieldObjectType<
      RefreshAgentTokenHttpEndpoint['mfdocHttpDefinition']['pathParamaters']
    >,
    InferFieldObjectType<
      RefreshAgentTokenHttpEndpoint['mfdocHttpDefinition']['query']
    >,
    InferFieldObjectOrMultipartType<
      RefreshAgentTokenHttpEndpoint['mfdocHttpDefinition']['requestBody']
    >,
    InferFieldObjectType<
      RefreshAgentTokenHttpEndpoint['mfdocHttpDefinition']['responseHeaders']
    >,
    InferFieldObjectType<
      RefreshAgentTokenHttpEndpoint['mfdocHttpDefinition']['responseBody']
    >
  >({
    path: kAgentTokenConstants.routes.refreshToken,
    method: HttpEndpointMethod.Post,
    requestBody: refreshAgentTokenParams,
    requestHeaders:
      mfdocEndpointHttpHeaderItems.requestHeaders_AuthRequired_JsonContentType,
    responseHeaders:
      mfdocEndpointHttpHeaderItems.responseHeaders_JsonContentType,
    responseBody: refreshAgentTokenSuccessResponseBody,
    tags: [kEndpointTag.public],
    name: 'fimidara/agentTokens/refreshToken',
    description:
      'Refresh an agent token to get a new JWT with extended expiration. Use the refresh token to obtain a new JWT without re-authentication.',
  });

export const encodeAgentTokenEndpointDefinition =
  mfdocConstruct.constructHttpEndpointDefinition<
    InferFieldObjectType<
      EncodeAgentTokenHttpEndpoint['mfdocHttpDefinition']['requestHeaders']
    >,
    InferFieldObjectType<
      EncodeAgentTokenHttpEndpoint['mfdocHttpDefinition']['pathParamaters']
    >,
    InferFieldObjectType<
      EncodeAgentTokenHttpEndpoint['mfdocHttpDefinition']['query']
    >,
    InferFieldObjectOrMultipartType<
      EncodeAgentTokenHttpEndpoint['mfdocHttpDefinition']['requestBody']
    >,
    InferFieldObjectType<
      EncodeAgentTokenHttpEndpoint['mfdocHttpDefinition']['responseHeaders']
    >,
    InferFieldObjectType<
      EncodeAgentTokenHttpEndpoint['mfdocHttpDefinition']['responseBody']
    >
  >({
    path: kAgentTokenConstants.routes.encodeToken,
    method: HttpEndpointMethod.Post,
    requestBody: encodeAgentTokenParams,
    requestHeaders:
      mfdocEndpointHttpHeaderItems.requestHeaders_AuthRequired_JsonContentType,
    responseHeaders:
      mfdocEndpointHttpHeaderItems.responseHeaders_JsonContentType,
    responseBody: encodeAgentTokenSuccessResponseBody,
    tags: [kEndpointTag.public],
    name: 'fimidara/agentTokens/encodeToken',
    description:
      'Encode an agent token into JWT format for use in API requests. This converts the raw token into a signed JWT that can be used for authentication.',
  });
