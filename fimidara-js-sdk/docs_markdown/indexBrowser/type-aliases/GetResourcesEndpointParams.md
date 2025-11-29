[**fimidara**](../../README.md)

***

[fimidara](../../modules.md) / [indexBrowser](../README.md) / GetResourcesEndpointParams

# Type Alias: GetResourcesEndpointParams

> **GetResourcesEndpointParams** = `object`

Parameters for fetching multiple resources in a single request. This allows batch operations for better performance.

## Example

```json
{
  "workspaceId": "wrkspce_000000000000000000000",
  "resources": [
    {
      "action": "read",
      "filepath": "/documents/report.pdf"
    },
    {
      "action": "read",
      "folderpath": "/images"
    },
    {
      "action": "write",
      "resourceId": "file000_000000000000000000000"
    }
  ]
}
```

## Properties

### resources

> **resources**: [`FetchResourceItem`](FetchResourceItem.md)[]

Array of resource fetch specifications. Each item describes how to identify and what action to perform on a resource.

#### Example

```json
[
  {
    "action": "read",
    "filepath": "/documents/report.pdf"
  }
]
```

***

### workspaceId?

> `optional` **workspaceId**: `string`

The ID of the workspace to fetch resources from. If not provided, uses the user's default workspace.

#### Example

```
wrkspce_000000000000000000000
```
