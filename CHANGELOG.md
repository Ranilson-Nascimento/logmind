# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
