[**fimidara**](../../README.md)

***

[fimidara](../../modules.md) / [indexBrowser](../README.md) / GetPermissionGroupEndpointParams

# Type Alias: GetPermissionGroupEndpointParams

> **GetPermissionGroupEndpointParams** = `object`

Parameters for retrieving a single permission group by ID or name

## Properties

### name?

> `optional` **name**: `string`

Permission group name. Either provide the permission group ID, or provide the workspace ID and permission group name

#### Example

```
Editors
```

***

### permissionGroupId?

> `optional` **permissionGroupId**: `string`

Permission group ID. Either provide the permission group ID, or provide the workspace ID and permission group name

#### Example

```
pmgroup_000000000000000000000
```

***

### workspaceId?

> `optional` **workspaceId**: `string`

Workspace ID. When not provided, will default to using workspace ID from agent token. Either provide the permission group ID, or provide the workspace ID and permission group name

#### Example

```
wrkspce_000000000000000000000
```
