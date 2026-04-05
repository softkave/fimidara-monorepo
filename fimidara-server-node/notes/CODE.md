# fimidara Server Node – Code Structure

## Overview

This is a high-level guide to the server's code organization. Not all files and folders are listed.

- `notes/`: Project notes (roadmap, bugs, setup, etc.).
- `config/`: Configuration files.
- `src/contexts/`: Core server setup (database connections, caching, etc.).
- `src/endpoints/`: Main server entry points (HTTP routes).
- `src/db/`: Database models.
- `src/definitions/`: Data structure definitions.
- `src/emailTemplates/`: Email templates.
- `src/middleware/`: Express middleware.
- `src/resources/`: Configuration definitions (name may be misleading).
- `src/scripts/`: (Currently unused) For scripts like data migrations.
- `src/tools/`: Utilities for server tasks (e.g., dev user setup, SDK test setup).
- `src/utils/`: General-purpose utilities and functions.
- `src/vitest/`: [`vitest`](https://vitest.dev/) configuration files.
- `src/index.ts`: Server entry point.
