# fimidara Server Node – Setup Guide

## Environment & Configuration

- **Config Management:** Uses [`config`](https://www.npmjs.com/package/config) for configuration and [`env-cmd`](https://www.npmjs.com/package/env-cmd) for environment variables.
- **Environment Files:**
  - `.env.dev` – Development
  - `.env.unit-test` – Unit tests
  - `.env.integration-test` – Integration tests
  - `.env` – Production
- **Config Files:**
  - `config/default.json` – Default settings
  - `config/custom-environment-variables.json` – Required environment variables
  - `config/development.json`, `config/local-development.json` – Local development
  - `config/test.json`, `config/local-test.json` – Local testing
- For a full list of config options, see `src/resources/config.ts`.

## Prerequisites

- Install [Redis](https://redis.io/docs/latest/operate/oss_and_stack/install/).
- Set up the appropriate `.env` file for your environment.
- Install dependencies:
  ```sh
  pnpm i
  ```

## Running the Development Server

1. Set up `.env.dev`.
2. Start the dev server (runs Redis, MongoDB, and the app):
   ```sh
   npx -y -- tsx src/tools/dev/index.ts dev
   ```
3. (Optional) Generate a dev user:
   ```sh
   npx env-cmd -f ".env.dev" npx tsx src/tools/dev-user-setup/index.ts
   ```
   Or create a user manually after the server starts.

## Running Tests

1. Set up `.env.unit-test`.
2. Run tests (spins up Redis, MongoDB, and runs Vitest):
   ```sh
   npx -y -- tsx src/tools/dev/index.ts test some-test.test.ts
   ```
