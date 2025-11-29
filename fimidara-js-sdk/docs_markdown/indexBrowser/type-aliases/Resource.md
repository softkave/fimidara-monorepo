[**fimidara**](../../README.md)

***

[fimidara](../../modules.md) / [indexBrowser](../README.md) / Resource

# Type Alias: Resource

> **Resource** = `object`

The actual resource data. The structure varies depending on the resource type (file, folder, workspace, etc.).

## Example

```json
{
  "resourceId": "file000_000000000000000000000",
  "name": "report.pdf",
  "workspaceId": {
    "__id": "FieldString",
    "description": "Workspace ID",
    "example": "wrkspce_000000000000000000000"
  },
  "createdAt": 1672531200000,
  "lastUpdatedAt": 1672531200000
}
```

## Properties

### createdAt

> **createdAt**: `number`

UTC timestamp in milliseconds

#### Example

```
1672531200000
```

***

### createdBy?

> `optional` **createdBy**: [`Agent`](Agent.md)

Represents a user or system entity that performed an action (e.g., created or updated a resource)

***

### deletedAt?

> `optional` **deletedAt**: `number`

UTC timestamp in milliseconds

#### Example

```
1672531200000
```

***

### deletedBy?

> `optional` **deletedBy**: [`Agent`](Agent.md)

Represents a user or system entity that performed an action (e.g., created or updated a resource)

***

### isDeleted

> **isDeleted**: `boolean`

***

### lastUpdatedAt

> **lastUpdatedAt**: `number`

UTC timestamp in milliseconds

#### Example

```
1672531200000
```

***

### lastUpdatedBy?

> `optional` **lastUpdatedBy**: [`Agent`](Agent.md)

Represents a user or system entity that performed an action (e.g., created or updated a resource)

***

### resourceId

> **resourceId**: `string`

Resource ID

#### Example

```
wrkspce_000000000000000000000
```
