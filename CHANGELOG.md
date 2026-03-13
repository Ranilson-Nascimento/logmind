# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-03-13

### Added

- **Redact**: `initLogger({ redact: { keys, patterns?, replacement? } })` to redact sensitive fields (e.g. `password`, `token`) from log output.
- **Sampling**: `initLogger({ sampling: { perLevel: { debug: 0.1, info: 1 } } })` to sample logs by level and reduce volume.
- **Rate limiting**: `initLogger({ rateLimit: { ... } })` and `resetRateLimitState()` to throttle repeated logs.
- **Child logger**: `createChildLogger(extraContext)` so all logs from that logger include the given context (e.g. `requestId`, `userId`).
- **Diagnosis severity**: `diagnose(err)` and `log.auto(err)` now include `severity` (`low` | `medium` | `high`) in the diagnosis object.
- **OTLP transport**: `createOtlpTransport(options)` and `transport: otlp` for OTLP-compatible backends (Grafana, Datadog, Jaeger, etc.).
- **Syslog transport**: `createSyslogTransport(options)` for UDP/TCP Syslog servers.
- **Express middleware**: `logmind/express` – `createExpressMiddleware(options)` to attach request context and optional request logging.
- **Fastify plugin**: `logmind/fastify` – `createFastifyPlugin(options)` for Fastify apps.
- **Config file**: `loadConfig(opts?, cwd?)` to load `logmind.config.json` and merge with options.
- **CLI**: `npx logmind doctor` (or `logmind doctor`) to verify Logmind loads and run a quick diagnosis sample.

### Changed

- **Package exports**: `main` and `module`/`exports` now point to the actual tsup output (`.js` for CJS, `.mjs` for ESM) for correct resolution when installing from npm.

### Documentation

- README (EN/PT-BR): Live demo section with link to GitHub Pages; badge at top linking to the demo.
- Demo page: New examples (redact, sampling, child logger, Express middleware, OTLP, Syslog) and updated transports list.

[1.1.0]: https://github.com/Ranilson-Nascimento/logmind/releases/tag/v1.1.0

## [1.0.0] - 2026-01-27

### Added

- **Logger**: `log.debug`, `log.info`, `log.warn`, `log.error`, `log.auto(err)`.
- **Context**: `withContext(ctx, fn)`, `withContextAsync(ctx, fn)`, `getContext`, `setContext`, `clearContext`. All logs inside a context block inherit `userId`, `requestId`, etc.
- **Auto-diagnosis**: `log.auto(err)` and `diagnose(err)` classify errors (database, network, permission, validation, timeout, known, unknown) and attach hints and suggested actions.
- **Production mode**: Drops debug logs, groups repeated errors, and emits `[repeated Nx]` summaries to reduce noise and observability cost.
- **Transports**: JSON (stdout), file (with rotation), webhook (optional batching), MongoDB, Elasticsearch, Firebase/Firestore. Config via `initLogger({ transport, ... })`.
- **Platforms**: Node, browser, React Native. `initLogger` infers platform; `initReactNative` and `initBrowser` helpers for app setup.
- **Structured log format**: `timestamp`, `level`, `message`, `env`, `app`, `version`, `context`, `device`, `origin`, `stack`, `error` (with `diagnosis`), `meta`.
- **Exports**: `logmind/react-native` subpath for React Native apps.

### Documentation

- README (English) and README.pt-BR (Portuguese).
- Examples: Node (basic, context, auto-diagnosis, file transport), Express middleware, React Native init.

[1.0.0]: https://github.com/Ranilson-Nascimento/logmind/releases/tag/v1.0.0
