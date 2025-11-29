[**fimidara**](../../README.md)

***

[fimidara](../../modules.md) / [indexBrowser](../README.md) / ReadFileEndpointParams

# Type Alias: ReadFileEndpointParams

> **ReadFileEndpointParams** = `object`

Parameters for reading/downloading a file with optional image processing

## Properties

### download?

> `optional` **download**: `boolean`

Whether the server should add "Content-Disposition: attachment" header which forces browsers to download files like HTML, JPEG, etc. which it'll otherwise open in the browser

***

### fileId?

> `optional` **fileId**: `string`

File ID

#### Example

```
file000_000000000000000000000
```

***

### filepath?

> `optional` **filepath**: `string`

File path, with each folder name separated by a forward slash. The first item must be the workspace rootname, and must include the file extension. e.g /workspace-rootname/my-folder/my-file.txt.

#### Example

```
/workspace-rootname/my-folder/my-file.txt
```

***

### ifRangeHeader?

> `optional` **ifRangeHeader**: `string`

Raw If-Range header value extracted from HTTP request

#### Example

```
"etag-value"
```

***

### imageFormat?

> `optional` **imageFormat**: [`ImageFormatEnum`](ImageFormatEnum.md)

Format to transform image to if file is an image

#### Example

```
webp
```

***

### imageResize?

> `optional` **imageResize**: [`ImageResizeParams`](ImageResizeParams.md)

Parameters for resizing images on-the-fly during file retrieval

***

### rangeHeader?

> `optional` **rangeHeader**: `string`

Raw Range header value extracted from HTTP request (for parsing after file size is known)

#### Example

```
bytes=0-499
```

***

### ranges?

> `optional` **ranges**: [`Range`](Range.md)[]

Array of byte ranges to request. For single range, array has one element. For multipart ranges, array has multiple elements.
