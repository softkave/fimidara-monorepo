[**fimidara**](../../README.md)

***

[fimidara](../../modules.md) / [indexBrowser](../README.md) / RevokeCollaboratorEndpointParams

# Type Alias: RevokeCollaboratorEndpointParams

> **RevokeCollaboratorEndpointParams** = `object`

Parameters for removing a collaborator from a workspace.

## Properties

### collaboratorId

> **collaboratorId**: `string`

ID of the collaborator to remove from the workspace.

#### Example

```
user000_000000000000000000000
```

***

### workspaceId?

> `optional` **workspaceId**: `string`

ID of the workspace to remove the collaborator from. If not provided, the user's default workspace is used.

#### Example

```
wrkspce_000000000000000000000
```
