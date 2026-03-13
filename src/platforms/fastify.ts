/**
 * Logmind – Fastify plugin
 * Injects requestId and optional userId into context and logs request start/finish.
 * Requires: npm install fastify (peer).
 */

import { withContext, log } from "../index.js";

function randomId(): string {
  if (typeof require !== "undefined") {
    try {
      const { randomUUID } = require("node:crypto") as { randomUUID: () => string };
      return randomUUID();
    } catch {}
  }
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export interface FastifyLogmindOptions {
  requestIdHeader?: string;
  userIdHeader?: string;
}

interface FastifyInstance {
  addHook(name: string, fn: (request: FastifyRequest, reply: FastifyReply, done?: () => void) => void | Promise<void>): void;
}

interface FastifyRequest {
  headers: Record<string, string | undefined>;
  url: string;
  method: string;
  requestId?: string;
  _logmindStart?: number;
}

interface FastifyReply {
  statusCode: number;
}

/**
 * Returns a Fastify plugin that runs each request inside Logmind context and logs start/finish.
 * Use: fastify.register(createFastifyPlugin(), { requestIdHeader: 'x-request-id' })
 */
export function createFastifyPlugin(opts?: FastifyLogmindOptions) {
  const requestIdHeader = opts?.requestIdHeader ?? "x-request-id";
  const userIdHeader = opts?.userIdHeader ?? "x-user-id";

  return async function logmindPlugin(instance: FastifyInstance) {
    instance.addHook("onRequest", async (request: FastifyRequest, _reply: FastifyReply) => {
      const requestId = request.headers[requestIdHeader] || randomId();
      const userId = request.headers[userIdHeader] || "anonymous";
      request.requestId = requestId;
      request._logmindStart = Date.now();

      withContext(
        { requestId, userId, path: request.url, method: request.method },
        () => {
          log.info("HTTP request started", { path: request.url, method: request.method });
        }
      );
    });

    instance.addHook("onResponse", async (request: FastifyRequest, reply: FastifyReply) => {
      const start = request._logmindStart;
      if (start != null) {
        const durationMs = Date.now() - start;
        log.info("HTTP request finished", {
          path: request.url,
          method: request.method,
          statusCode: reply.statusCode,
          durationMs,
        });
      }
    });
  };
}

export { log, withContext, getLogger } from "../index.js";
