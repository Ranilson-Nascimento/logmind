/**
 * Logmind – Modo produção
 * Filtra debug, agrupa erros iguais, resume exceções repetidas.
 */

import type { LogEntry, LogLevel } from "./types.js";
import { levelScore } from "./formatter.js";

interface ProductionState {
  lastErrorKey: string | null;
  lastErrorTime: number;
  repeatCount: number;
  seenKeys: Map<string, number>;
}

const state: ProductionState = {
  lastErrorKey: null,
  lastErrorTime: 0,
  repeatCount: 0,
  seenKeys: new Map(),
};

const REPEAT_WINDOW_MS = 60_000;
const MAX_REPEAT_BEFORE_SUPPRESS = 5;

function errorKey(entry: LogEntry): string {
  const m = entry.message;
  const code = entry.error?.code ?? "";
  const name = entry.error?.name ?? "";
  return `${m}|${code}|${name}`;
}

function shouldDropByLevel(entry: LogEntry, minLevel: LogLevel): boolean {
  return levelScore(entry.level) < levelScore(minLevel);
}

/**
 * Em produção: remove debug, opcionalmente info.
 * Agrupa erros iguais e resume após N repetições.
 */
export function productionFilter(
  entry: LogEntry,
  minLevel: LogLevel = "info"
): LogEntry | null {
  if (shouldDropByLevel(entry, minLevel)) {
    return null;
  }

  if (entry.level !== "error") {
    return entry;
  }

  const key = errorKey(entry);
  const now = Date.now();

  if (state.lastErrorKey !== key || now - state.lastErrorTime > REPEAT_WINDOW_MS) {
    state.lastErrorKey = key;
    state.lastErrorTime = now;
    state.repeatCount = 1;
    state.seenKeys.set(key, 1);
    return entry;
  }

  state.repeatCount++;
  state.seenKeys.set(key, state.repeatCount);

  if (state.repeatCount <= MAX_REPEAT_BEFORE_SUPPRESS) {
    return entry;
  }

  if (state.repeatCount === MAX_REPEAT_BEFORE_SUPPRESS + 1) {
    return {
      ...entry,
      message: `[repeated ${state.repeatCount}x] ${entry.message}`,
      meta: {
        ...entry.meta,
        _logmind_repeated: state.repeatCount,
        _logmind_key: key,
      },
    };
  }

  return null;
}

export function resetProductionState(): void {
  state.lastErrorKey = null;
  state.lastErrorTime = 0;
  state.repeatCount = 0;
  state.seenKeys.clear();
}
