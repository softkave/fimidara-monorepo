[**fimidara**](../../README.md)

***

[fimidara](../../modules.md) / [indexBrowser](../README.md) / ResourceWrapper

# Type Alias: ResourceWrapper

> **ResourceWrapper** = `object`

Wraps a resource with metadata about its type and ID. This provides context about what kind of resource is being returned.

## Example

```json
{
  "resourceId": "file000_000000000000000000000",
  "resourceType": "file",
  "resource": {
    "resourceId": "file000_000000000000000000000",
    "createdAt": 1672531200000,
    "lastUpdatedAt": 1672531200000,
    "lastUpdatedBy": {
      "agentId": "agtoken_000000000000000000000",
      "agentType": "agentToken"
    },
    "createdBy": {
      "agentId": "agtoken_000000000000000000000",
      "agentType": "agentToken"
    }
  }
}
```

## Properties

### resource

> **resource**: [`Resource`](Resource.md)

The resource data. Structure depends on the resource type specified in resourceType field.

#### Example

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

***

### resourceId

> **resourceId**: `string`

The unique identifier of the resource.

#### Example

```
wrkspce_000000000000000000000
```

***

### resourceType

> **resourceType**: [`FimidaraResourceType`](FimidaraResourceType.md)

The type of resource (e.g., "file", "folder", "workspace", "collaborationRequest").

#### Example

```
file
```
