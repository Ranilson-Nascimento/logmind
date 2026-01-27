/**
 * Logmind – Contexto de execução
 * Propagação automática de userId, requestId, etc. para todos os logs no bloco.
 */

import type { LogContext } from "./types.js";

interface ContextStorage {
  get(): LogContext;
  set(ctx: LogContext): void;
  clear(): void;
  run<T>(ctx: LogContext, fn: () => T): T;
}

function createStorage(): ContextStorage {
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

const storage: ContextStorage = createStorage();

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
 */
export async function withContextAsync<T>(
  ctx: LogContext,
  fn: () => Promise<T>
): Promise<T> {
  return new Promise((resolve, reject) => {
    storage.run(ctx, () => {
      Promise.resolve(fn()).then(resolve).catch(reject);
    });
  });
}
