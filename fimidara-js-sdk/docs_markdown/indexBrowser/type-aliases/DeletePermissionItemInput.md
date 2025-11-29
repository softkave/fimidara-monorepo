[**fimidara**](../../README.md)

***

[fimidara](../../modules.md) / [indexBrowser](../README.md) / DeletePermissionItemInput

# Type Alias: DeletePermissionItemInput

> **DeletePermissionItemInput** = `object`

Input for deleting a permission item. At least one target (targetId, filepath, folderpath, or workspaceRootname) must be specified.

## Properties

### access?

> `optional` **access**: `boolean`

Access level to remove. If not specified, removes both grant and deny permissions.

#### Example

```
true
```

***

### action?

> `optional` **action**: [`FimidaraPermissionAction`](FimidaraPermissionAction.md) \| [`FimidaraPermissionAction`](FimidaraPermissionAction.md)[]

Permission action(s) to remove. If not specified, removes all actions.

#### Example

```
uploadFile
```

***

### entityId?

> `optional` **entityId**: `string` \| `string`[]

Entity ID(s) to remove permissions from. If not specified, removes permissions for all entities.

#### Example

```
user000_000000000000000000000
```

***

### filepath?

> `optional` **filepath**: `string` \| `string`[]

File path(s) to remove permissions from

#### Example

```
/workspace-rootname/my-folder/my-file.txt
```

***

### folderpath?

> `optional` **folderpath**: `string` \| `string`[]

Folder path(s) to remove permissions from

#### Example

```
/workspace-rootname/my-folder/my-sub-folder
```

***

### targetId?

> `optional` **targetId**: `string` \| `string`[]

Specific resource ID(s) to remove permissions from

#### Example

```
folder0_000000000000000000000
```

***

### workspaceRootname?

> `optional` **workspaceRootname**: `string`

Workspace root name to remove permissions from

#### Example

```
fimidara-rootname
```
