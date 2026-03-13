# Logmind

[![npm version](https://img.shields.io/npm/v/logmind.svg)](https://www.npmjs.com/package/logmind)
[![bundle size](https://img.shields.io/bundlephobia/minzip/logmind)](https://www.npmjs.com/package/logmind)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/Ranilson-Nascimento/logmind/actions/workflows/ci.yml/badge.svg)](https://github.com/Ranilson-Nascimento/logmind/actions/workflows/ci.yml)

**🇺🇸 English** · **🇧🇷 [Português (pt-BR)](README.pt-BR.md)**

**Unified, contextual logging with automatic error diagnosis for Node, browser and React Native. One API, zero fuss.**

### Why Logmind?

- **One logger for full‑stack apps**: Same API in Node, browser and React Native.
- **Built‑in context propagation**: Attach `userId`, `requestId`, `tenantId` once and have it in every log.
- **Automatic error diagnosis**: `log.auto(err)` classifies errors (database, network, permission, validation, timeout, known) and adds hints.
- **Production‑ready out of the box**: Drops noisy debug logs in production, groups repeated errors and summarizes bursts.
- **Pluggable transports**: JSON (stdout), file (with rotation), webhook, MongoDB, Elasticsearch, Firebase/Firestore – pick only what you need.

---

### Table of contents

- **Overview**
  - [Installation](#installation)
  - [Quick start (Node)](#quick-start-node)
  - [Browser & React Native](#browser--react-native)
- **Core concepts**
  - [Context propagation](#context-propagation)
  - [Automatic diagnosis (`log.auto`)](#automatic-diagnosis-logauto)
  - [Transports](#transports)
  - [Production mode](#production-mode)
- **API reference**
  - [Main API](#api-reference)
  - [Platform helpers](#platform-helpers)
- **Project**
  - [Live demo](#live-demo)
  - [Running examples](#run-examples-locally)
  - [Development & testing](#development)
  - [Releases](#releases)
  - [License](#license)

---

## Installation

```bash
npm install logmind
# or
yarn add logmind
```

## Quick start (Node)

```js
import { initLogger, log } from "logmind";

initLogger({
  app: "my-api",
  version: "1.0.0",
  env: process.env.NODE_ENV,
});

log.info("Service started");
log.warn("Token expiring soon");

try {
  // ... your code
} catch (error) {
  log.error("Failed to save order", error, { orderId: "ord_123" });
  log.auto(error);
}
```

## Browser & React Native

### Browser

```js
import { initBrowser, log } from "logmind/browser";

initBrowser({
  app: "my-webapp",
  version: "1.0.0",
  captureGlobalErrors: true, // logs window.onerror + unhandledrejection
});

log.info("Page loaded");
log.auto(new Error("Test error in browser"));
```

### React Native

```js
import { initReactNative, log } from "logmind/react-native";

initReactNative({
  app: "my-rn-app",
  version: "1.0.0",
});

log.info("Screen mounted");
log.auto(err);
```

Use `transport: "json"` or `"webhook"` in React Native. File, Mongo and Firebase transports are Node‑only.

---

## Context propagation

Attach context (user, company, request, etc.) once and automatically include it in all subsequent logs inside a block.

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

Every log inside the callback automatically includes `userId`, `companyId` and `requestId`.

### Async handlers

For HTTP frameworks and other async flows you can use `withContextAsync`:

```ts
import { withContextAsync, log } from "logmind";

app.post("/orders", (req, res) => {
  withContextAsync(
    { userId: req.user.id, requestId: req.id },
    async () => {
      log.info("Creating order");
      // await createOrder(...)
      log.info("Order created");
      res.sendStatus(201);
    }
  );
});
```

You can also manage context manually with `getContext`, `setContext` and `clearContext` when necessary.

---

## Automatic diagnosis (`log.auto`)

```js
try {
  await callExternalService();
} catch (err) {
  log.auto(err, "External service failed", { service: "payments" });
}
```

Logmind inspects the error and adds an `error.diagnosis` field to the log:

- **category**: `database`, `network`, `permission`, `validation`, `timeout`, `known`, `unknown`
- **code** (optional): Error code when available
- **hint**: Short human‑friendly explanation
- **suggestedAction**: What to look at next

This works out of the box – no extra configuration or schemas required.

---

## Transports

### JSON (default)

Stdout, one JSON line per log.

```js
initLogger({
  app: "x",
  version: "1.0.0",
  transport: "json",
});
```

### File (Node)

Append to a file with optional rotation.

```js
initLogger({
  app: "x",
  version: "1.0.0",
  transport: "file",
  file: { path: "./logs/app.log", maxSize: "10m", maxFiles: 5 },
});
```

### Webhook

POST each log (or batches) to an HTTP endpoint.

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

### MongoDB (Node, peer `mongodb`)

```js
initLogger({
  app: "x",
  version: "1.0.0",
  transport: "mongo",
  mongo: { uri: "mongodb://...", collection: "logs", db: "mydb" },
});
```

### Elasticsearch

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

### Firebase / Firestore (Node, peer `firebase-admin`)

```js
initLogger({
  app: "x",
  version: "1.0.0",
  transport: "firebase",
  firebase: {
    projectId: "my-project",
    collection: "logs",
    credentials: { /* service account */ },
  },
});
```

---

## Production mode

When `env === "production"` (or `production: true`), Logmind:

- Drops `debug` logs.
- Keeps `info` and above.
- Groups identical errors and, after a repeat threshold, emits a single `[repeated Nx]` summary instead of flooding.

This keeps stdout clean and helps reduce observability costs while still surfacing important events.

---

## Redact sensitive data

Redact keys (and optional regex patterns) from `context`, `meta`, and `error` before sending to any transport.

```js
initLogger({
  app: "my-api",
  version: "1.0.0",
  redact: {
    keys: ["password", "token", "authorization"],
    patterns: [/bearer\s+[\w.-]+/gi],
    replacement: "[REDACTED]",
  },
});

log.info("User login", { userId: "u1", password: "secret" });
// meta.password is sent as "[REDACTED]"
```

---

## Sampling and rate limiting

**Sampling** – send a fraction of logs by level (e.g. 10% of debug, 100% of error):

```js
initLogger({
  app: "my-api",
  version: "1.0.0",
  sampling: {
    perLevel: { debug: 0.1, info: 0.5, warn: 1, error: 1 },
  },
});
```

**Rate limit** – cap logs per “key” within a time window to avoid flooding:

```js
initLogger({
  app: "my-api",
  version: "1.0.0",
  rateLimit: {
    windowMs: 60_000,
    maxPerKey: 100,
    keyFn: (entry) => `${entry.level}|${entry.message}`,
  },
});
```

---

## Child logger

Create a logger that always adds fixed context (e.g. component, service name):

```js
import { createChildLogger, log } from "logmind";

const billingLog = createChildLogger({ component: "billing", service: "payments" });
billingLog.info("Charge created", { amount: 99 });
// Every log includes context.component and context.service
```

---

## Config file (Node)

Optionally load base options from `logmind.config.json` in the project root. Runtime `initLogger(opts)` overrides file values.

```json
{
  "app": "my-api",
  "version": "1.0.0",
  "env": "production",
  "redact": { "keys": ["password", "token"] },
  "transport": "json"
}
```

```js
import { initLogger, loadConfig } from "logmind";

initLogger(loadConfig({ version: "1.0.1" }));
```

---

## Express and Fastify

**Express** – middleware that injects `requestId` and `userId` into context and logs each request start/finish with duration:

```js
import express from "express";
import { createExpressMiddleware } from "logmind/express";

const app = express();
app.use(createExpressMiddleware({ requestIdHeader: "x-request-id", userIdHeader: "x-user-id" }));
```

**Fastify** – plugin with the same behavior:

```js
import Fastify from "fastify";
import { createFastifyPlugin } from "logmind/fastify";

const app = Fastify();
await app.register(createFastifyPlugin(), { requestIdHeader: "x-request-id" });
```

---

## OTLP and Syslog transports

**OTLP (OpenTelemetry)** – send logs to an OTLP HTTP endpoint (e.g. Grafana, Honeycomb):

```js
initLogger({
  app: "my-api",
  version: "1.0.0",
  transport: "otlp",
  otlp: { url: "https://otel.example.com", serviceName: "my-api" },
});
```

**Syslog** (Node) – UDP or TCP:

```js
initLogger({
  app: "my-api",
  version: "1.0.0",
  transport: "syslog",
  syslog: { host: "127.0.0.1", port: 514, protocol: "udp" },
});
```

---

## CLI

Check that Logmind loads and diagnosis works:

```bash
npx logmind doctor
```

---

## Logmind vs other loggers

|                        | Logmind                                                     | Winston                    | Pino                    |
|------------------------|-------------------------------------------------------------|----------------------------|-------------------------|
| **Context propagation**| `withContext({ userId, requestId }, fn)` – automatic        | Manual / child loggers     | Manual / bindings       |
| **Error diagnosis**    | `log.auto(err)` → category, hint, suggestedAction           | No                         | No                      |
| **Node + Browser + RN**| Same API, one package                                      | Mostly Node                | Mostly Node             |
| **Structured JSON**    | Yes                                                        | Via formatters             | Yes                     |
| **Production tuning**  | Drops debug, groups repeats, `[repeated Nx]`                | Configurable               | Configurable            |

---

## API reference

### Main API

| Export | Description |
|--------|-------------|
| `initLogger(opts)` | Configure app, version, env, platform, transport, redact, sampling, rateLimit. |
| `log` | Logger instance with `log.debug`, `log.info`, `log.warn`, `log.error`, `log.auto(err, message?, meta?)`. |
| `getLogger()` | Returns the same logger instance as `log`. |
| `createChildLogger(extraContext)` | Logger that adds fixed context to every log. |
| `withContext(ctx, fn)` | Run `fn` with context; logs inside inherit it. |
| `withContextAsync(ctx, fn)` | Async variant for request handlers and async flows. |
| `getContext` / `setContext` / `clearContext` | Low-level context access. |
| `diagnose(err)` | Returns `{ category, code?, hint?, suggestedAction?, severity? }`. |
| `createTransport(type, config)` | Manually create a transport (json, file, webhook, mongo, elasticsearch, firebase, otlp, syslog). |
| `loadConfig(opts?, cwd?)` | Load options from `logmind.config.json` and merge with opts (Node). |
| `applyRedact(entry, config)` | Apply redaction to an entry. |
| `resetRateLimitState()` | Reset in-memory rate limit counters (tests). |

### Platform helpers

- `logmind/browser` – `initBrowser(options)` + `log`
- `logmind/react-native` – `initReactNative(options)` + `log`
- `logmind/express` – `createExpressMiddleware(options)` for Express
- `logmind/fastify` – `createFastifyPlugin(options)` for Fastify

All share the same logger semantics as the Node entrypoint.

---

## Live demo

### Online demo (GitHub Pages)

You can try Logmind without cloning the repo using the hosted demo:

- **GitHub Pages**: `https://ranilson-nascimento.github.io/logmind/demo/`

### Run locally

A **browser demo** lets you try Logmind in the browser: live logger, context propagation, and auto-diagnosis with sample errors.

1. From the repo root: `npm run build && npx serve . -p 5000`
2. Open **http://localhost:5000/docs/demo/** in your browser.

You can also open `docs/demo/index.html` after building and serve it with any static server.

---

## Run examples locally

Examples live in this repository (they are not included in the npm tarball) so the published package stays small.

**Setup once:**

```bash
git clone https://github.com/Ranilson-Nascimento/logmind.git
cd logmind
npm install
npm run build
```

**Examples:**

| Script | Description |
|--------|-------------|
| `npm run example:basic` | Minimal Node: init + log levels |
| `npm run example:context` | `withContext` – logs inherit userId, requestId |
| `npm run example:diagnosis` | `log.auto(err)` – database, network, validation samples |
| `npm run example:file` | File transport with rotation |
| `npm run example:production` | Production mode: debug dropped, repeated errors summarized |
| `npm run example:webhook` | Webhook transport (starts a small echo server) |
| `npm run example:express` | Express with sync context middleware |
| `npm run example:express-async` | Express with `withContextAsync` for async handlers |

---

## Development

```bash
npm install
npm run build
npm run test
npm run demo
```

Examples: `npm run example:basic`, `example:context`, `example:diagnosis`, `example:file`, `example:production`, `example:webhook`, `example:express`, `example:express-async`.

See `TESTING.md` for details. Contributions are welcome via pull requests and issues.

---

## Releases

Logmind is published on [`npm` (`logmind`)](https://www.npmjs.com/package/logmind). New versions are released when the maintainer bumps the version in `package.json` and pushes. Install the latest with:

```bash
npm install logmind
```

or a specific version:

```bash
npm install logmind@1.0.0
```

See `CHANGELOG.md` for release history.

---

## Localization

This repository maintains an official Portuguese translation of this README at `README.pt-BR.md`. When you update the English README for a release, please update the Portuguese translation to keep both in sync.

---

## License

MIT.
