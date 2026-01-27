/**
 * Logmind – Formatação
 * Stack trace limpo, JSON estrutural.
 */

import type { LogEntry, LogLevel } from "./types.js";

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export function levelScore(level: LogLevel): number {
  return LEVEL_ORDER[level] ?? 0;
}

export function cleanStack(stack: string | undefined): string | undefined {
  if (!stack || typeof stack !== "string") return undefined;
  const lines = stack.split("\n").filter((line) => {
    const t = line.trim();
    if (!t) return false;
    if (t.startsWith("at ")) return true;
    return t.length > 0 && !t.startsWith("at ");
  });
  return lines.slice(0, 15).join("\n");
}

export function toJSON(entry: LogEntry, pretty = false): string {
  const out: Record<string, unknown> = {
    level: entry.level,
    message: entry.message,
    timestamp: entry.timestamp,
    env: entry.env,
  };
  if (entry.app) out.app = entry.app;
  if (entry.version) out.version = entry.version;
  if (entry.context && Object.keys(entry.context).length > 0) out.context = entry.context;
  if (entry.device && Object.keys(entry.device).length > 0) out.device = entry.device;
  if (entry.origin) out.origin = entry.origin;
  if (entry.stack) out.stack = entry.stack;
  if (entry.error) out.error = entry.error;
  if (entry.meta && Object.keys(entry.meta).length > 0) out.meta = entry.meta;
  return pretty ? JSON.stringify(out, null, 2) : JSON.stringify(out);
}
