/**
 * Logmind – Express middleware
 * Injects requestId and optional userId into context and logs request start/finish.
 * Requires: npm install express (peer).
 */

import { withContext, log } from "../index.js";

interface ExpressRequest {
  headers: Record<string, string | string[] | undefined>;
  path: string;
  method: string;
  requestId?: string;
}

interface ExpressResponse {
  statusCode: number;
  on(event: "finish", fn: () => void): void;
}

type NextFunction = () => void;

function randomId(): string {
  if (typeof require !== "undefined") {
    try {
      const { randomUUID } = require("node:crypto") as { randomUUID: () => string };
      return randomUUID();
    } catch {}
  }
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export interface ExpressMiddlewareOptions {
  /** Header name for request ID (default x-request-id). */
  requestIdHeader?: string;
  /** Header name for user ID (default x-user-id). */
  userIdHeader?: string;
  /** Log request body size or not. */
  logBody?: boolean;
}

/**
 * Express middleware that runs each request inside a Logmind context (requestId, userId)
 * and logs request start and finish with duration.
 */
export function createExpressMiddleware(opts: ExpressMiddlewareOptions = {}): (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => void {
  const requestIdHeader = opts.requestIdHeader ?? "x-request-id";
  const userIdHeader = opts.userIdHeader ?? "x-user-id";

  return function logmindMiddleware(req: ExpressRequest, res: ExpressResponse, next: NextFunction): void {
    const rawReqId = req.headers[requestIdHeader];
    const requestId = (Array.isArray(rawReqId) ? rawReqId[0] : rawReqId) || randomId();
    const rawUserId = req.headers[userIdHeader];
    const userId = (Array.isArray(rawUserId) ? rawUserId[0] : rawUserId) || "anonymous";
    req.requestId = requestId;

    const start = Date.now();

    withContext(
      {
        requestId,
        userId,
        path: req.path,
        method: req.method,
      },
      () => {
        log.info("HTTP request started", {
          path: req.path,
          method: req.method,
        });

        res.on("finish", () => {
          const durationMs = Date.now() - start;
          log.info("HTTP request finished", {
            path: req.path,
            method: req.method,
            statusCode: res.statusCode,
            durationMs,
          });
        });

        next();
      }
    );
  };
}

export { log, withContext, getLogger } from "../index.js";

// Type augmentation for Express when used with @types/express
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}
