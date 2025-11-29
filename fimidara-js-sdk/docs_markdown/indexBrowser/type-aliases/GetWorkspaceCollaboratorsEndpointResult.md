[**fimidara**](../../README.md)

***

[fimidara](../../modules.md) / [indexBrowser](../README.md) / GetWorkspaceCollaboratorsEndpointResult

# Type Alias: GetWorkspaceCollaboratorsEndpointResult

> **GetWorkspaceCollaboratorsEndpointResult** = `object`

Result of getting a list of workspace collaborators.

## Properties

### collaborators

> **collaborators**: [`Collaborator`](Collaborator.md)[]

List of collaborators in the workspace.

#### Example

```json
[
  {
    "resourceId": "user000_000000000000000000000",
    "workspaceId": {
      "__id": "FieldString",
      "description": "Workspace ID",
      "example": "wrkspce_000000000000000000000"
    },
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "lastUpdatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

***

### page

> **page**: `number`

The current page number of results returned.

#### Example

```
1
```
