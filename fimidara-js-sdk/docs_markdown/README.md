**fimidara**

***

# fimidara

JavaScript SDK for [fimidara.com](https://www.fimidara.com), a file storage service. See REST API and other documentation at [https://www.fimidara.com/docs](https://www.fimidara.com/docs).

<br></br>

## Installation

- Using `npm` - `npm install fimidara`
- Using `yarn` - `yarn add fimidara`
- Using `pnpm` - `pnpm add fimidara`
- Using `bun` - `bun add fimidara`

<br></br>

## JS SDK Usage

### Exports

The `fimidara` package provides different exports optimized for different environments:

<br></br>

#### Main Exports

- **`fimidara/indexIsomorphic` (default)** - Isomorphic version that works in both browser and Node.js environments. Provides core functionality like `FimidaraEndpoints`, `RefreshAgentToken`, and basic file operations. See [Isomorphic documentation](https://github.com/softkave/fimidara/tree/main/fimidara-js-sdk/docs_markdown/indexIsomorphic/README.md).

- **`fimidara/indexNode`** - Server-side version with additional Node.js-specific functions like `multipartUploadNode` for handling large file uploads on the server. See [Node.js documentation](https://github.com/softkave/fimidara/tree/main/fimidara-js-sdk/docs_markdown/indexNode/README.md).

- **`fimidara/indexBrowser`** - Browser-specific version with additional browser-only functions like `multipartUploadBrowser` for handling large file uploads in the browser. See [Browser documentation](https://github.com/softkave/fimidara/tree/main/fimidara-js-sdk/docs_markdown/indexBrowser/README.md).

<br></br>

#### Utility Exports

- **`fimidara/node`** - Node.js utility functions like `getNodeDirContent` for reading local directory contents.

<br></br>

#### Smart Import System

The package uses modern JavaScript module resolution to automatically provide the right version for your environment. In most cases, you can simply use the default import:

```typescript
// Recommended: Let the bundler choose the right version
import * as fimidara from 'fimidara';

// This automatically resolves to:
// - Browser: fimidara/indexBrowser
// - Node.js: fimidara/indexNode
// - Universal: fimidara/indexIsomorphic (isomorphic)
```

<br></br>

#### Explicit Imports (Advanced)

If you need specific functionality or want more control, you can import directly:

```typescript
// For server-side applications (Node.js, Next.js API routes, etc.)
import * as fimidara from 'fimidara/indexNode';

// For browser-only applications
import * as fimidara from 'fimidara/indexBrowser';

// For isomorphic applications (works everywhere)
import * as fimidara from 'fimidara/indexIsomorphic';

// For Node.js utilities only
import {getNodeDirContent} from 'fimidara/node';
```

<br></br>

#### When to Use Each Version

- **Use default import (`fimidara`)** for most applications - it's the safest choice
- **Use `fimidara/indexNode`** when you need server-side specific features like `multipartUploadNode`
- **Use `fimidara/indexBrowser`** when you need browser-specific features like `multipartUploadBrowser`
- **Use `fimidara/node`** when you only need Node.js utility functions

<br></br>

### Setting up fimidara

There are two ways to set up `fimidara` using a JWT token generated from an agent token.

```typescript
// Import fimidara
import * as fimidara from 'fimidara';

// Set up fimidara using JWT token
const fimidaraEndpoints = new fimidara.FimidaraEndpoints({
  authToken: '<JWT token>',
});

// Change auth token
fimidara.setSdkConfig({authToken: '<new JWT token>'});
fimidara.setSdkAuthToken('<new JWT token>');

// Retrieve config
const fimidaraSdkConfig = fimidara.getSdkConfig();
```

You can also use automatically refreshing agent tokens for JWT tokens configured to expire after a timeout, using `RefreshAgentToken`.

```typescript
// Import fimidara
import * as fimidara from 'fimidara';

// Set up fimidara using RefreshAgentToken
const fimidaraEndpoints = new fimidara.FimidaraEndpoints();
const autoRefreshToken = new fimidara.RefreshAgentToken({
  token: {
    jwtTokenExpiresAt: 1704067200000, // Your set token expiration timestamp
    jwtToken: '<JWT token>',
    refreshToken: '<Refresh token>',
  },
  endpoints: fimidaraEndpoints, // Provide an endpoints instance to use
});

// Change auth token
fimidara.setSdkConfig({authToken: autoRefreshToken});
fimidara.setSdkAuthToken(autoRefreshToken);

// Retrieve config
const fimidaraSdkConfig = fimidara.getSdkConfig();
```

If you are self-hosting `fimidara`, you can also change the `serverURL` when you create a `FimidaraEndpoints` instance, or for each API call. Similarly, you can also provide auth tokens per API call. This is useful for cases where different tokens have different permissions.

```typescript
// Import fimidara
import * as fimidara from 'fimidara';

// Set up fimidara with custom server URL
const fimidaraEndpoints = new fimidara.FimidaraEndpoints({
  authToken: '<default JWT token>',
  serverURL: 'https://api.fimidara.com',
});

// Make an API call with your SDK-default auth token and serverURL
const file = await fimidara.files.readFile({
  filepath: 'workspace-rootname/folder/path/to/file.png',
});

// Make an API call with a different auth token or serverURL
const file = await fimidara.files.readFile(
  {
    filepath:
      'very-private-workspace-rootname/very-private-folder/path/to/file.png',
  },
  {
    authToken: '<very private JWT token>', // You can also provide a RefreshAgentToken instance
    serverURL: '<very private server URL>',
  }
);
```

<br></br>

### Making API calls

fimidara provides several APIs for operating with files, folders, permissions, agent tokens, etc. You can access them through an instance of [`FimidaraEndpoints`](https://github.com/softkave/fimidara/tree/main/fimidara-js-sdk/docs_markdown/indexBrowser/classes/FimidaraEndpoints.md).

```typescript
// Import fimidara
import * as fimidara from 'fimidara';

// Set up fimidara using JWT token
const fimidaraEndpoints = new fimidara.FimidaraEndpoints({
  authToken: '<JWT token>',
});

// Read a file
const someFile = await fimidara.files.readFile(
  {
    filepath: 'workspace-rootname/folder/path/to/file.txt',
  },
  {
    // Use 'blob' for browser environments, and 'stream' for server-side.
    // If responseType is 'blob', then someFile will be an instance of Blob.
    // It will be an instance of ReadableStream if responseType is 'stream'.
    responseType: 'blob',
  }
);

// Read folder information
const {folder: someRootFolder} = await fimidara.folders.readFolder({
  filepath: 'workspace-rootname/some-root-folder',
});
const {folder: someChildFolder} = await fimidara.folders.readFolder({
  filepath: 'workspace-rootname/some-root-folder/some-child-folder',
});
```

<br></br>

### Utility and advanced functions

The `fimidara` JS SDK also provides other utility and advanced functions, including:

- Reading folder content on server-side environments
- Diffing a list of files (not actual file content)
- Getting full URLs for files hosted on `fimidara`
- Handling multipart uploads (for very large files up to 50GB) in browser or server-side environments

```typescript
// Import fimidara
import * as fimidara from 'fimidara';

// Set up fimidara using JWT token
const fimidaraEndpoints = new fimidara.FimidaraEndpoints({
  authToken: '<JWT token>',
});

// Get a read file URL for use in HTML
<img
  src={fimidara.getFimidaraReadFileURL({
    filepath: 'workspace-rootname/folder/path/to/image.png',
  })}
/>;

// Get an upload file URL, e.g., for form uploads
const uploadFileURL = fimidara.getFimidaraUploadFileURL({
  filepath: 'workspace-rootname/folder/path/to/file.png',
});

// Do multipart file upload on server-side, e.g., Node.js
await multipartUploadNode({
  data: 'a very large string', // Or Readable or Buffer
  size, // Size of data to upload
  localFilepath: 'some/local/file.txt', // You can use localFilepath instead of data
  filepath: 'workspace/folder/destination.txt', // filepath on fimidara
  clientMultipartId: '<some multipart ID>', // Multipart ID for tracking uploads
  resume: true, // Whether to reuse an existing multipart upload if there's one
  endpoints: fimidaraEndpoints, // an instance of FimidaraEndpoints
  numConcurrentParts: 2, // How many concurrent parts are uploaded at a time
  maxRetryCount: 0, // How many parts should be retried before the entire operation fails
  afterPart: hookParams => {
    // Called after a part has been uploaded
  },
  beforePart: p => {
    // Called before a part is uploaded
  },
  // ... other optional props similar to fimidara.files.uploadFile(...)
});

// Do multipart file upload in browser
await multipartUploadBrowser({
  data: 'a very large string', // Or Blob
  size, // Size of data to upload
  filepath: 'workspace/folder/destination.txt', // filepath on fimidara
  clientMultipartId: '<some multipart ID>', // Multipart ID for tracking uploads
  resume: true, // Whether to reuse an existing multipart upload if there's one
  endpoints: fimidaraEndpoints, // an instance of FimidaraEndpoints
  // ... other optional props similar to fimidara.files.uploadFile(...)
});
```

<br></br>

## CLI Usage

The fimidara JS SDK also provides a CLI.

<br></br>

### Installation

After installing the fimidara package, the CLI is available as `fimidara`:

```bash
# Install fimidara globally
npm install -g fimidara

# Or use npx to run without global installation
npx fimidara --help
```

<br></br>

### Available Commands

#### sync

Sync a file or folder between your local filesystem and fimidara.

**Usage:**

```bash
fimidara sync [options]
```

**Options:**

| Option           | Short | Description                                                      | Required | Default                    |
| ---------------- | ----- | ---------------------------------------------------------------- | -------- | -------------------------- |
| `--fimidarapath` | `-f`  | File or folder path on fimidara                                  | Yes      | -                          |
| `--localpath`    | `-l`  | File or folder path on local filesystem                          | Yes      | -                          |
| `--direction`    | `-d`  | Sync direction: `up`, `down`, or `both`                          | Yes      | -                          |
| `--recursive`    | `-r`  | Include folder children content (not just files)                 | No       | `true`                     |
| `--matchTree`    | `-m`  | Match folder tree one-to-one (deletes files not found in source) | No       | `false`                    |
| `--authToken`    | `-t`  | Fimidara auth token                                              | No       | -                          |
| `--serverURL`    | `-u`  | Fimidara server URL                                              | No       | `https://api.fimidara.com` |
| `--silent`       | `-s`  | Do not print logs                                                | No       | `false`                    |

<br></br>

**Direction Options:**

- `up`: Upload from local to fimidara
- `down`: Download from fimidara to local
- `both`: Sync in both directions

<br></br>

**Examples:**

```bash
# Upload a local folder to fimidara
fimidara sync \
  --fimidarapath "my-workspace/projects/myapp" \
  --localpath "./src" \
  --direction up \
  --recursive

# Download a file from fimidara to local
fimidara sync \
  --fimidarapath "my-workspace/documents/report.pdf" \
  --localpath "./downloads/report.pdf" \
  --direction down

# Sync a folder in both directions (bidirectional sync)
fimidara sync \
  --fimidarapath "my-workspace/shared/config" \
  --localpath "./config" \
  --direction both \
  --matchTree

# Use custom server and auth token
fimidara sync \
  --fimidarapath "workspace/data" \
  --localpath "./data" \
  --direction up \
  --serverURL "https://my-fimidara-server.com" \
  --authToken "your-jwt-token-here"

# Silent mode (no logs)
fimidara sync \
  --fimidarapath "workspace/logs" \
  --localpath "./logs" \
  --direction down \
  --silent
```

<br></br>

**Short Options Examples:**

```bash
# Using short option names
fimidara sync -f "workspace/docs" -l "./docs" -d up -r

# Download with custom server
fimidara sync -f "workspace/file.txt" -l "./file.txt" -d down -u "https://custom-server.com" -t "your-token"
```

<br></br>

**Important Notes:**

- The `--matchTree` option is useful for keeping two locations in perfect sync:

  - When `direction` is `up`: Deletes files in fimidara that don't exist locally
  - When `direction` is `down`: Deletes local files that don't exist in fimidara
  - Use with caution as it can result in data loss

- The `--recursive` option is enabled by default. Set to `false` to sync only the specified folder/file without its contents.
- Authentication tokens can be provided via the `--authToken` option or by setting environment variables.
- For self-hosted fimidara instances, use the `--serverURL` option to specify your custom server URL.
