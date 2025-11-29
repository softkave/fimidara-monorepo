[**fimidara**](../../README.md)

***

[fimidara](../../modules.md) / [indexBrowser](../README.md) / PermissionItemInput

# Type Alias: PermissionItemInput

> **PermissionItemInput** = `object`

Input for creating a new permission item. Must specify target (targetId, filepath, folderpath, or workspaceRootname), entity, action, and access level.

## Properties

### access

> **access**: `boolean`

Whether to grant (true) or deny (false) access

#### Example

```
true
```

***

### action

> **action**: [`FimidaraPermissionAction`](FimidaraPermissionAction.md) \| [`FimidaraPermissionAction`](FimidaraPermissionAction.md)[]

Permission action(s) to grant/deny (e.g., readFile, uploadFile, deleteFolder)

#### Example

```
uploadFile
```

***

### entityId

> **entityId**: `string` \| `string`[]

Entity ID(s) to grant/deny permission to (user, permission group, or agent token)

#### Example

```
user000_000000000000000000000
```

***

### filepath?

> `optional` **filepath**: `string` \| `string`[]

File path(s) to grant/deny permission to

#### Example

```
/workspace-rootname/my-folder/my-file.txt
```

***

### folderpath?

> `optional` **folderpath**: `string` \| `string`[]

Folder path(s) to grant/deny permission to

#### Example

```
/workspace-rootname/my-folder/my-sub-folder
```

***

### targetId?

> `optional` **targetId**: `string` \| `string`[]

Specific resource ID(s) to grant/deny permission to

#### Example

```
folder0_000000000000000000000
```

***

### workspaceRootname?

> `optional` **workspaceRootname**: `string`

Workspace root name to grant/deny permission to

#### Example

```
fimidara-rootname
```
