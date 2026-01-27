# Contributing to Logmind

Thanks for considering contributing. Here's how to get started.

## Setup

```bash
git clone https://github.com/Ranilson-Nascimento/logmind.git
cd logmind
npm install
npm run build
npm run test
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Build `dist/` (ESM + CJS + types) |
| `npm run test` | Run tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Lint `src/` |
| `npm run clean` | Remove `dist/` |
| `npm run example:basic` | Run basic example (requires build) |

## Making changes

1. Create a branch from `main` (or `master`).
2. Implement your change. Keep the existing style (TypeScript, no emojis in code).
3. Add or update tests in `tests/` if needed.
4. Run `npm run build` and `npm run test`.
5. Update `CHANGELOG.md` under `[Unreleased]` for user-facing changes.
6. Open a pull request.

## Tests

Tests live in `tests/` and use [Vitest](https://vitest.dev). We test:

- `diagnose()` — error classification
- `withContext` / `getContext` — context propagation
- `productionFilter` — production behaviour
- `createTransport("json")` — JSON transport
- `initLogger` + `log` — end-to-end with a mock transport

Run `npm run test` before submitting a PR.

## Code style

- TypeScript strict mode.
- Prefer clear names and small functions.
- Comments in Portuguese or English are fine; keep them concise.

## Publishing to npm

The package is published to npm automatically when you **create a GitHub Release** or **push a tag** `v*` (e.g. `v1.0.0`). Configure the **NPM_TOKEN** secret (Settings → Secrets and variables → Actions) with an npm granular token (Read and write, Bypass 2FA). Ensure `package.json` version matches the tag (e.g. `1.0.0` ↔ `v1.0.0`).

## Questions

Open an [issue](https://github.com/Ranilson-Nascimento/logmind/issues) for bugs, ideas, or questions.
