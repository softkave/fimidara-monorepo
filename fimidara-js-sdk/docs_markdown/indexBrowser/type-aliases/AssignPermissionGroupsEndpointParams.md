[**fimidara**](../../README.md)

***

[fimidara](../../modules.md) / [indexBrowser](../README.md) / AssignPermissionGroupsEndpointParams

# Type Alias: AssignPermissionGroupsEndpointParams

> **AssignPermissionGroupsEndpointParams** = `object`

Parameters for assigning permission groups to entities

## Properties

### entityId

> **entityId**: `string` \| `string`[]

Entity ID or array of entity IDs (users, collaborators, or agent tokens) to assign permission groups to

#### Example

```
user000_000000000000000000000
```

***

### permissionGroupId

> **permissionGroupId**: `string` \| `string`[]

Permission group ID or array of permission group IDs to assign

#### Example

```
pmgroup_000000000000000000000
```

***

### workspaceId?

> `optional` **workspaceId**: `string`

Workspace ID where the assignment will take place. If not provided, uses the workspace from the agent token

#### Example

```
wrkspce_000000000000000000000
```
