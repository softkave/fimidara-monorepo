[**fimidara**](../../README.md)

***

[fimidara](../../modules.md) / [indexBrowser](../README.md) / GetPresignedPathsForFilesEndpointParams

# Type Alias: GetPresignedPathsForFilesEndpointParams

> **GetPresignedPathsForFilesEndpointParams** = `object`

## Properties

### files?

> `optional` **files**: [`FileMatcher`](FileMatcher.md)[]

List of files to generate presigned paths for. Each file can be identified by either filepath or fileId

***

### workspaceId?

> `optional` **workspaceId**: `string`

ID of the workspace containing the files. If not provided, uses the default workspace

#### Example

```
wrkspce_000000000000000000000
```
