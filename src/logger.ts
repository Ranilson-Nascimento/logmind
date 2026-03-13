/**
 * Logmind – Logger principal
 * API unificada: info, warn, error, auto (diagnóstico), contexto, modo produção.
 * Redact, sampling e rate limit opcionais.
 */

import type { LogEntry, LogLevel, InitOptions, Transport, DeviceInfo, Platform, LogContext } from "./types.js";
import { getContext, withContext } from "./context.js";
import { cleanStack } from "./formatter.js";
import { diagnose } from "./diagnosis/index.js";
import { productionFilter } from "./production.js";
import { createTransport } from "./transports/index.js";
import { applyRedact } from "./redact.js";
import { shouldRateLimit } from "./rateLimit.js";

let app: string | undefined;
let version: string | undefined;
let env: string = "development";
let platform: Platform = "node";
let transport: Transport = createTransport("json", {});
let production = false;
let device: DeviceInfo | (() => DeviceInfo) | undefined;
let redactConfig: InitOptions["redact"];
let samplingConfig: InitOptions["sampling"];
let rateLimitConfig: InitOptions["rateLimit"];

function defaultEnv(): string {
  if (typeof process !== "undefined" && process.env?.NODE_ENV) {
    return process.env.NODE_ENV;
  }
  return "development";
}

function defaultPlatform(): Platform {
  const g = typeof globalThis !== "undefined" ? (globalThis as Record<string, unknown>) : {};
  const nav = g.navigator as { product?: string } | undefined;
  if (nav?.product === "ReactNative") return "react-native";
  if (typeof g.window !== "undefined") return "browser";
  return "node";
}

function resolveDevice(): DeviceInfo | undefined {
  if (!device) return undefined;
  return typeof device === "function" ? device() : device;
}

function buildEntry(
  level: LogLevel,
  message: string,
  error?: unknown,
  meta?: Record<string, unknown>
): LogEntry {
  const ctx = getContext();
  const errObj = error instanceof Error ? error : undefined;
  const diagnosis = errObj ? diagnose(errObj) : undefined;
  const stack = errObj?.stack ? cleanStack(errObj.stack) : undefined;

  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    env,
    context: Object.keys(ctx).length ? ctx : undefined,
    device: resolveDevice(),
    origin: platform,
    meta,
  };

  if (app) entry.app = app;
  if (version) entry.version = version;
  if (stack) entry.stack = stack;

  if (errObj) {
    entry.error = {
      name: errObj.name,
      message: errObj.message,
      code: (errObj as { code?: string }).code,
      stack,
      diagnosis,
    };
  }

  return entry;
}

function shouldSample(level: LogLevel): boolean {
  const perLevel = samplingConfig?.perLevel;
  if (!perLevel || perLevel[level] == null) return true;
  const ratio = perLevel[level];
  if (ratio >= 1) return true;
  if (ratio <= 0) return false;
  return Math.random() < ratio;
}

function emit(entry: LogEntry): void {
  if (!shouldSample(entry.level)) return;
  if (rateLimitConfig?.maxPerKey != null && shouldRateLimit(entry, rateLimitConfig)) return;
  let out: LogEntry | null = entry;
  if (redactConfig?.keys?.length || redactConfig?.patterns?.length) {
    out = applyRedact(out, redactConfig);
  }
  if (production) {
    out = productionFilter(out, "info");
  }
  if (out) {
    try {
      transport.send(out);
    } catch {
      // evita recursão ao falhar transporte
    }
  }
}

function log(level: LogLevel, message: string, error?: unknown, meta?: Record<string, unknown>): void {
  const entry = buildEntry(level, message, error, meta);
  emit(entry);
}

export interface LogMind {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, error?: unknown, meta?: Record<string, unknown>): void;
  error(message: string, error?: unknown, meta?: Record<string, unknown>): void;
  auto(error: unknown, message?: string, meta?: Record<string, unknown>): void;
}

export const logmind: LogMind = {
  debug(m, meta) {
    log("debug", m, undefined, meta);
  },
  info(m, meta) {
    log("info", m, undefined, meta);
  },
  warn(m, err?, meta?) {
    log("warn", m, err, meta);
  },
  error(m, err?, meta?) {
    log("error", m, err, meta);
  },
  auto(err: unknown, message?: string, meta?: Record<string, unknown>) {
    const msg = message ?? (err instanceof Error ? err.message : String(err));
    log("error", msg, err, meta);
  },
};

function resolveTransport(opts: InitOptions): Transport {
  const t = opts.transport;
  if (t && typeof (t as Transport).send === "function") {
    return t as Transport;
  }
  if (typeof t === "string") {
    const configMap: Record<string, unknown> = {
      mongo: opts.mongo,
      file: opts.file,
      webhook: opts.webhook,
      elasticsearch: opts.elasticsearch,
      firebase: opts.firebase,
      otlp: opts.otlp,
      syslog: opts.syslog,
      json: {},
    };
    const config = configMap[t] ?? {};
    return createTransport(t, config);
  }
  return createTransport("json", {});
}

/**
 * Inicializa o logger. Configure app, versão, ambiente, plataforma, transporte, redact, sampling e rateLimit.
 */
export function initLogger(opts: InitOptions): void {
  app = opts.app;
  version = opts.version;
  env = opts.env ?? defaultEnv();
  platform = opts.platform ?? defaultPlatform();
  production = opts.production ?? env === "production";
  device = opts.device;
  redactConfig = opts.redact;
  samplingConfig = opts.sampling;
  rateLimitConfig = opts.rateLimit;
  transport = resolveTransport(opts);
}

export function getLogger(): LogMind {
  return logmind;
}

/**
 * Cria um logger que adiciona contexto fixo a todos os logs (ex: component, service).
 */
export function createChildLogger(extraContext: LogContext): LogMind {
  return {
    debug(m, meta) {
      withContextForChild(extraContext, () => logmind.debug(m, meta));
    },
    info(m, meta) {
      withContextForChild(extraContext, () => logmind.info(m, meta));
    },
    warn(m, err?, meta?) {
      withContextForChild(extraContext, () => logmind.warn(m, err, meta));
    },
    error(m, err?, meta?) {
      withContextForChild(extraContext, () => logmind.error(m, err, meta));
    },
    auto(err: unknown, message?: string, meta?: Record<string, unknown>) {
      withContextForChild(extraContext, () => logmind.auto(err, message, meta));
    },
  };
}

function withContextForChild(ctx: LogContext, fn: () => void): void {
  withContext(ctx, fn);
}
