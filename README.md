# Logmind

[![npm version](https://img.shields.io/npm/v/logmind.svg)](https://www.npmjs.com/package/logmind)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/Ranilson-Nascimento/logmind/actions/workflows/ci.yml/badge.svg)](https://github.com/Ranilson-Nascimento/logmind/actions/workflows/ci.yml)

**🇧🇷 [Documentação em português](README.pt-BR.md)**

Unified, contextual logging with auto-diagnosis. Node, browser, React Native. One API, zero fuss.

## What it does

- **Structured logs**: JSON with timestamp, env, app, version, context, device, origin, and optional stack.
- **Automatic context**: `withContext({ userId, requestId }, () => { ... })` — every log inside inherits it.
- **Auto-diagnosis**: `log.auto(err)` classifies errors (database, network, permission, validation, timeout, known) and adds hints.
- **Production mode**: Drops debug, groups repeated errors, and summarizes bursts to keep stdout clean and observability costs low.
- **Transports**: JSON (stdout), file (with rotation), webhook, MongoDB, Elasticsearch, Firebase/Firestore. Use what you need.

## Logmind vs others

| | Logmind | Winston | Pino |
|--|--------|---------|------|
| **Context propagation** | `withContext({ userId, requestId }, fn)` — all logs inside inherit it | Manual / child loggers | Manual / bindings |
| **Error diagnosis** | `log.auto(err)` — category, hint, suggestedAction | No | No |
| **Node + Browser + RN** | Same API, one package | Node-focused | Node-focused |
| **Structured JSON** | Yes | Via formatters | Yes |
| **Production tuning** | Drops debug, groups repeats, `[repeated Nx]` | Configurable | Configurable |

## Install

```bash
npm install logmind
```

## Quick start

```js
import { initLogger, log } from "logmind";

initLogger({ app: "my-api", version: "1.0.0" });

log.info("Service started");
log.warn("Token expiring soon");
log.error("Failed to save order", error);
```

## Context

```js
import { withContext, log } from "logmind";

withContext(
  { userId: "123", companyId: "456", requestId: "abc-xyz" },
  () => {
    log.info("Order created");
    log.info("Payment processed", { orderId: "ord_789" });
  }
);
```

All logs inside the callback automatically include `userId`, `companyId`, and `requestId`.

## Auto-diagnosis

```js
log.auto(err);
```

Logmind inspects the error and adds a `diagnosis` field: `category` (database, network, permission, validation, timeout, known, unknown), optional `code`, `hint`, and `suggestedAction`. No extra setup.

## Transports

**JSON (default)** — stdout, one JSON line per log:

```js
initLogger({ app: "x", version: "1.0.0", transport: "json" });
```

**File** — append to a file with optional rotation (Node only):

```js
initLogger({
  app: "x",
  version: "1.0.0",
  transport: "file",
  file: { path: "./logs/app.log", maxSize: "10m", maxFiles: 5 },
});
```

**Webhook** — POST each log (or batched) to a URL:

```js
initLogger({
  app: "x",
  version: "1.0.0",
  transport: "webhook",
  webhook: {
    url: "https://your-ingest.example/logs",
    headers: { "X-API-Key": "..." },
    batch: true,
    batchSize: 10,
    batchMs: 2000,
  },
});
```

**MongoDB** — persist to a collection (Node only, peer `mongodb`):

```js
initLogger({
  app: "x",
  version: "1.0.0",
  transport: "mongo",
  mongo: { uri: "mongodb://...", collection: "logs", db: "mydb" },
});
```

**Elasticsearch** — index logs:

```js
initLogger({
  app: "x",
  version: "1.0.0",
  transport: "elasticsearch",
  elasticsearch: {
    node: "https://...",
    index: "logmind-logs",
    auth: { username: "elastic", password: "..." },
  },
});
```

**Firebase / Firestore** — store in a collection (Node only, peer `firebase-admin`):

```js
initLogger({
  app: "x",
  version: "1.0.0",
  transport: "firebase",
  firebase: { projectId: "my-project", collection: "logs", credentials: {...} },
});
```

## Production mode

When `env === "production"` (or `production: true`), Logmind:

- Drops `debug` logs.
- Keeps `info` and above.
- Groups identical errors and, after a repeat threshold, emits a single `[repeated Nx]` summary instead of flooding.

## React Native

```js
import { initReactNative, log } from "logmind/react-native";

initReactNative({ app: "my-app", version: "1.0.0" });

log.info("Screen mounted");
log.auto(err);
```

Use `transport: "json"` or `"webhook"` in RN. File, Mongo, and Firebase are Node-only.

## Browser

```js
import { initBrowser, log } from "logmind/browser";

initBrowser({ app: "my-app", version: "1.0.0", captureGlobalErrors: true });

log.info("Page loaded");
log.auto(err);
```

`captureGlobalErrors: true` (default) registers `window.onerror` and `unhandledrejection` and logs them automatically.

## API

| Export | Description |
|--------|-------------|
| `initLogger(opts)` | Configure app, version, env, platform, transport. |
| `log` | `log.debug`, `log.info`, `log.warn`, `log.error`, `log.auto(err, message?, meta?)`. |
| `getLogger()` | Same as `log`. |
| `withContext(ctx, fn)` | Run `fn` with context; logs inside inherit it. |
| `withContextAsync(ctx, fn)` | Async variant for request handlers. |
| `getContext` / `setContext` / `clearContext` | Low-level context access. |
| `diagnose(err)` | Returns `{ category, code?, hint?, suggestedAction? }`. |
| `createTransport(type, config)` | Build a transport manually. |

## Development

```bash
npm install
npm run build
npm run test
npm run example:basic
npm run example:context
npm run example:diagnosis
```

**[Examples](examples/)** · [How to test](TESTING.md)

## Releases

Logmind is published on [npm](https://www.npmjs.com/package/logmind). New versions are released when the maintainer bumps the version in `package.json` and pushes. Install the latest with `npm install logmind`, or a specific version with `npm install logmind@1.0.0`. See [CHANGELOG](CHANGELOG.md) for release history.

## License

MIT.
