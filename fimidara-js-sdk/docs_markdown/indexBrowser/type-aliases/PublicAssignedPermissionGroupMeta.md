[**fimidara**](../../README.md)

***

[fimidara](../../modules.md) / [indexBrowser](../README.md) / PublicAssignedPermissionGroupMeta

# Type Alias: PublicAssignedPermissionGroupMeta

> **PublicAssignedPermissionGroupMeta** = `object`

Metadata about a permission group assignment to an entity

## Properties

### assignedAt

> **assignedAt**: `number`

UTC timestamp in milliseconds when the permission group was assigned

#### Example

```
1697376600000
```

***

### assignedBy

> **assignedBy**: [`Agent`](Agent.md)

Information about who assigned this permission group

***

### assigneeEntityId

> **assigneeEntityId**: `string`

The ID of the entity (user, collaborator, or agent token) that was assigned the permission group

#### Example

```
user000_000000000000000000000
```

***

### permissionGroupId

> **permissionGroupId**: `string`

The ID of the assigned permission group

#### Example

```
pmgroup_000000000000000000000
```
