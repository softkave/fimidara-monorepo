[**fimidara**](../../README.md)

***

[fimidara](../../modules.md) / [indexBrowser](../README.md) / IssuePresignedPathEndpointParams

# Type Alias: IssuePresignedPathEndpointParams

> **IssuePresignedPathEndpointParams** = `object`

## Properties

### action?

> `optional` **action**: [`FimidaraPermissionAction`](FimidaraPermissionAction.md) \| [`FimidaraPermissionAction`](FimidaraPermissionAction.md)[]

The action the presigned path will be valid for. Defaults to "readFile" if not specified

#### Example

```
readFile
```

***

### duration?

> `optional` **duration**: `number`

How long the presigned path should remain valid, in seconds. Defaults to 3600 seconds (1 hour)

#### Example

```
3600
```

***

### expires?

> `optional` **expires**: `number`

Specific expiration timestamp for the presigned path. Alternative to duration

#### Example

```
1640995200000
```

***

### fileId?

> `optional` **fileId**: `string`

Unique identifier for the file. Required if filepath is not provided

#### Example

```
file000_000000000000000000000
```

***

### filepath?

> `optional` **filepath**: `string`

Full path to the file within the workspace. Required if fileId is not provided

#### Example

```
/documents/reports/quarterly-report.pdf
```

***

### usageCount?

> `optional` **usageCount**: `number`

Maximum number of times the presigned path can be used before it becomes invalid. Defaults to unlimited if not specified

#### Example

```
5
```
