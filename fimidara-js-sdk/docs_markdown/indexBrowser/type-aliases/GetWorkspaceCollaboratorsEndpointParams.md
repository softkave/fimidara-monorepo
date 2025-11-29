[**fimidara**](../../README.md)

***

[fimidara](../../modules.md) / [indexBrowser](../README.md) / GetWorkspaceCollaboratorsEndpointParams

# Type Alias: GetWorkspaceCollaboratorsEndpointParams

> **GetWorkspaceCollaboratorsEndpointParams** = `object`

Parameters for getting a list of workspace collaborators.

## Properties

### page?

> `optional` **page**: `number`

Page number to fetch. Starts from 1 for the first page.

#### Example

```
1
```

***

### pageSize?

> `optional` **pageSize**: `number`

Number of collaborators to fetch per page. Defaults to 20, maximum 100.

#### Example

```
20
```

***

### workspaceId?

> `optional` **workspaceId**: `string`

ID of the workspace to get collaborators from. If not provided, the user's default workspace is used.

#### Example

```
wrkspce_000000000000000000000
```
