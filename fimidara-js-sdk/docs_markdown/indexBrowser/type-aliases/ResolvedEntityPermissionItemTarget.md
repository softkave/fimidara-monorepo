[**fimidara**](../../README.md)

***

[fimidara](../../modules.md) / [indexBrowser](../README.md) / ResolvedEntityPermissionItemTarget

# Type Alias: ResolvedEntityPermissionItemTarget

> **ResolvedEntityPermissionItemTarget** = `object`

Represents the resolved target of a permission item, indicating what resource the permission applies to.

## Properties

### filepath?

> `optional` **filepath**: `string`

The file path if the permission applies to a specific file

#### Example

```
/workspace-rootname/my-folder/my-file.txt
```

***

### folderpath?

> `optional` **folderpath**: `string`

The folder path if the permission applies to a specific folder

#### Example

```
/workspace-rootname/my-folder/my-sub-folder
```

***

### targetId?

> `optional` **targetId**: `string`

The specific resource ID if the permission applies to a particular resource

#### Example

```
folder0_000000000000000000000
```

***

### workspaceRootname?

> `optional` **workspaceRootname**: `string`

The workspace root name if the permission applies to the entire workspace

#### Example

```
fimidara-rootname
```
