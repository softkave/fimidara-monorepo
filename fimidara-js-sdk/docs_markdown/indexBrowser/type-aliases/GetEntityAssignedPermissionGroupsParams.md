[**fimidara**](../../README.md)

***

[fimidara](../../modules.md) / [indexBrowser](../README.md) / GetEntityAssignedPermissionGroupsParams

# Type Alias: GetEntityAssignedPermissionGroupsParams

> **GetEntityAssignedPermissionGroupsParams** = `object`

Parameters for retrieving permission groups assigned to a specific entity

## Properties

### entityId

> **entityId**: `string`

ID of the entity (user, collaborator, or agent token) to get assigned permission groups for

#### Example

```
user000_000000000000000000000
```

***

### includeInheritedPermissionGroups?

> `optional` **includeInheritedPermissionGroups**: `boolean`

Whether to include permission groups not directly assigned but inherited through permission groups assigned to entity

#### Example

```
true
```

***

### workspaceId?

> `optional` **workspaceId**: `string`

Workspace ID to search within. If not provided, uses the workspace from the agent token

#### Example

```
wrkspce_000000000000000000000
```
