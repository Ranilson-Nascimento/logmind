/**
 * Logmind – Rate limit state
 * In-memory sliding window per key; used to drop excess logs.
 */

import type { LogEntry, RateLimitConfig } from "./types.js";

interface WindowState {
  count: number;
  windowStart: number;
}

const state = new Map<string, WindowState>();

function defaultKeyFn(entry: LogEntry): string {
  const code = entry.error?.code ?? "";
  const name = entry.error?.name ?? "";
  return `${entry.level}|${entry.message}|${code}|${name}`;
}

export function shouldRateLimit(entry: LogEntry, config: RateLimitConfig): boolean {
  const windowMs = config.windowMs ?? 60_000;
  const maxPerKey = config.maxPerKey ?? 100;
  const keyFn = config.keyFn ?? defaultKeyFn;
  const key = keyFn(entry);
  const now = Date.now();
  let w = state.get(key);
  if (!w) {
    state.set(key, { count: 1, windowStart: now });
    return false;
  }
  if (now - w.windowStart >= windowMs) {
    w = { count: 1, windowStart: now };
    state.set(key, w);
    return false;
  }
  w.count++;
  if (w.count > maxPerKey) return true;
  return false;
}

export function resetRateLimitState(): void {
  state.clear();
}
