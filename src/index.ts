/**
 * Logmind
 * Logger unificado com contexto, diagnóstico automático e transports configuráveis.
 *
 * Uso básico:
 *   import { initLogger, log } from "logmind";
 *   initLogger({ app: "my-api", version: "1.0.0" });
 *   log.info("Serviço iniciado");
 *
 * Com contexto:
 *   import { withContext, log } from "logmind";
 *   withContext({ userId: "123", requestId: "abc" }, () => {
 *     log.info("Pedido criado");
 *   });
 *
 * Diagnóstico automático:
 *   log.auto(err);
 */

export { initLogger, getLogger, logmind } from "./logger.js";
export type { LogMind } from "./logger.js";
export { withContext, withContextAsync, getContext, setContext, clearContext } from "./context.js";
export type { InitOptions, LogContext, LogEntry, LogLevel, Transport } from "./types.js";
export { diagnose } from "./diagnosis/index.js";
export type { DiagnosisResult, DiagnosisCategory } from "./types.js";
export { createTransport } from "./transports/index.js";
export { JsonTransport, FileTransport, WebhookTransport } from "./transports/index.js";
export { createMongoTransport, createElasticsearchTransport, createFirebaseTransport } from "./transports/index.js";

import { logmind } from "./logger.js";

/**
 * Atalho global. Equivalente a getLogger().
 * log.info(...) | log.warn(...) | log.error(...) | log.auto(err)
 */
export const log = logmind;
