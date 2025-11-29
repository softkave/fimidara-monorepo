[**fimidara**](../../README.md)

***

[fimidara](../../modules.md) / [indexBrowser](../README.md) / FimidaraEndpoints

# Class: FimidaraEndpoints

## Extends

- `AbstractSdkEndpoints`

## Constructors

### Constructor

> **new FimidaraEndpoints**(`config`, `inheritConfigFrom?`): `FimidaraEndpoints`

#### Parameters

##### config

[`SdkConfig`](../interfaces/SdkConfig.md)

##### inheritConfigFrom?

[`MfdocEndpointsBase`](MfdocEndpointsBase.md)\<[`SdkConfig`](../interfaces/SdkConfig.md)\>

#### Returns

`FimidaraEndpoints`

#### Inherited from

`AbstractSdkEndpoints.constructor`

## Properties

### agentTokens

> **agentTokens**: [`AgentTokensEndpoints`](AgentTokensEndpoints.md)

***

### collaborationRequests

> **collaborationRequests**: [`CollaborationRequestsEndpoints`](CollaborationRequestsEndpoints.md)

***

### collaborators

> **collaborators**: [`CollaboratorsEndpoints`](CollaboratorsEndpoints.md)

***

### files

> **files**: [`FilesEndpoints`](FilesEndpoints.md)

***

### folders

> **folders**: [`FoldersEndpoints`](FoldersEndpoints.md)

***

### jobs

> **jobs**: [`JobsEndpoints`](JobsEndpoints.md)

***

### permissionGroups

> **permissionGroups**: [`PermissionGroupsEndpoints`](PermissionGroupsEndpoints.md)

***

### permissionItems

> **permissionItems**: [`PermissionItemsEndpoints`](PermissionItemsEndpoints.md)

***

### presignedPaths

> **presignedPaths**: [`PresignedPathsEndpoints`](PresignedPathsEndpoints.md)

***

### resources

> **resources**: [`ResourcesEndpoints`](ResourcesEndpoints.md)

***

### usageRecords

> **usageRecords**: [`UsageRecordsEndpoints`](UsageRecordsEndpoints.md)

***

### workspaces

> **workspaces**: [`WorkspacesEndpoints`](WorkspacesEndpoints.md)

## Methods

### getSdkConfig()

> **getSdkConfig**(): [`SdkConfig`](../interfaces/SdkConfig.md)

#### Returns

[`SdkConfig`](../interfaces/SdkConfig.md)

#### Inherited from

`AbstractSdkEndpoints.getSdkConfig`

***

### setSdkAuthToken()

> **setSdkAuthToken**(`token`): `void`

#### Parameters

##### token

[`MfdocJsConfigAuthToken`](../type-aliases/MfdocJsConfigAuthToken.md)

#### Returns

`void`

#### Inherited from

`AbstractSdkEndpoints.setSdkAuthToken`

***

### setSdkConfig()

> **setSdkConfig**(`update`): `void`

#### Parameters

##### update

`Partial`\<[`MfdocJsConfigBase`](../interfaces/MfdocJsConfigBase.md)\>

#### Returns

`void`

#### Inherited from

`AbstractSdkEndpoints.setSdkConfig`
