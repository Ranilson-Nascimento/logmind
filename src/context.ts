/**
 * Logmind – Contexto de execução
 * Propagação automática de userId, requestId, etc. para todos os logs no bloco.
 * Em Node usa AsyncLocalStorage para propagar contexto através de await.
 */

import type { LogContext } from "./types.js";

interface ContextStorage {
  get(): LogContext;
  set(ctx: LogContext): void;
  clear(): void;
  run<T>(ctx: LogContext, fn: () => T): T;
}

function createSyncStorage(): ContextStorage {
  const store = new Map<number, LogContext>();
  let depth = 0;

  return {
    get() {
      const ctx = store.get(depth);
      return ctx ? { ...ctx } : {};
    },

    set(ctx: LogContext) {
      store.set(depth, { ...ctx });
    },

    clear() {
      store.delete(depth);
    },

    run<T>(ctx: LogContext, fn: () => T): T {
      depth++;
      const prev = store.get(depth - 1);
      const merged = prev ? { ...prev, ...ctx } : { ...ctx };
      store.set(depth, merged);
      try {
        return fn();
      } finally {
        store.delete(depth);
        depth--;
      }
    },
  };
}

function createAsyncLocalStorage(): ContextStorage | null {
  if (typeof process === "undefined" || !process.versions?.node) return null;
  try {
    const { AsyncLocalStorage } = require("node:async_hooks") as { AsyncLocalStorage: typeof import("node:async_hooks").AsyncLocalStorage };
    const asyncStorage = new AsyncLocalStorage<LogContext>();

    return {
      get() {
        const ctx = asyncStorage.getStore();
        return ctx ? { ...ctx } : {};
      },

      set(ctx: LogContext) {
        const prev = asyncStorage.getStore();
        asyncStorage.enterWith(prev ? { ...prev, ...ctx } : { ...ctx });
      },

      clear() {
        asyncStorage.enterWith(undefined as unknown as LogContext);
      },

      run<T>(ctx: LogContext, fn: () => T): T {
        const prev = asyncStorage.getStore();
        const merged = prev ? { ...prev, ...ctx } : { ...ctx };
        return asyncStorage.run(merged, fn);
      },
    };
  } catch {
    return null;
  }
}

const storage: ContextStorage = createAsyncLocalStorage() ?? createSyncStorage();

export function getContext(): LogContext {
  return storage.get();
}

export function setContext(ctx: LogContext): void {
  storage.set(ctx);
}

export function clearContext(): void {
  storage.clear();
}

/**
 * Executa `fn` com o contexto dado. Todo log dentro de `fn` herda esse contexto.
 */
export function withContext<T>(ctx: LogContext, fn: () => T): T {
  return storage.run(ctx, fn);
}

/**
 * Async variant. Use em handlers assíncronos (ex: Express, Fastify).
 * Em Node o contexto propaga através de await (AsyncLocalStorage).
 */
export async function withContextAsync<T>(
  ctx: LogContext,
  fn: () => Promise<T>
): Promise<T> {
  return storage.run(ctx, () => Promise.resolve(fn())) as Promise<T>;
}
