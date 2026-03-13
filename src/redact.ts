/**
 * Logmind – Redaction of sensitive data
 * Applies keys and patterns to objects/strings before sending to transport.
 */

import type { LogEntry, RedactConfig } from "./types.js";

const DEFAULT_REPLACEMENT = "[REDACTED]";

function redactString(value: string, config: RedactConfig): string {
  let out = value;
  const replacement = config.replacement ?? DEFAULT_REPLACEMENT;
  if (config.patterns?.length) {
    for (const p of config.patterns) {
      out = out.replace(p, replacement);
    }
  }
  return out;
}

function redactObject(obj: Record<string, unknown> | null | undefined, config: RedactConfig): Record<string, unknown> | undefined {
  if (obj == null || typeof obj !== "object") return obj as Record<string, unknown> | undefined;
  const keys = config.keys;
  const replacement = config.replacement ?? DEFAULT_REPLACEMENT;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    const keyLower = k.toLowerCase();
    const shouldRedactKey = keys?.some((key) => keyLower === key.toLowerCase());
    if (shouldRedactKey) {
      out[k] = replacement;
      continue;
    }
    if (v != null && typeof v === "object" && !Array.isArray(v) && !(v instanceof Date)) {
      out[k] = redactObject(v as Record<string, unknown>, config);
    } else if (typeof v === "string") {
      out[k] = redactString(v, config);
    } else {
      out[k] = v;
    }
  }
  return out;
}

export function applyRedact(entry: LogEntry, config: RedactConfig): LogEntry {
  if (!config.keys?.length && !config.patterns?.length) return entry;
  const out = { ...entry };
  if (entry.context) out.context = redactObject(entry.context as Record<string, unknown>, config) as LogEntry["context"];
  if (entry.meta) out.meta = redactObject(entry.meta, config);
  if (entry.error) {
    out.error = { ...entry.error };
    out.error.message = redactString(entry.error.message, config);
    if (entry.error.stack) out.error.stack = redactString(entry.error.stack, config);
  }
  return out;
}
