/**
 * Logmind – Transport Webhook
 * Envia cada log (ou batch) para uma URL HTTP.
 */

import type { LogEntry } from "../types.js";
import { toJSON } from "../formatter.js";

export interface WebhookTransportConfig {
  url: string;
  headers?: Record<string, string>;
  batch?: boolean;
  batchSize?: number;
  batchMs?: number;
}

const defaultHeaders: Record<string, string> = {
  "Content-Type": "application/json",
};

export class WebhookTransport {
  private url: string;
  private headers: Record<string, string>;
  private batch: boolean;
  private batchSize: number;
  private batchMs: number;
  private buffer: LogEntry[] = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(config: WebhookTransportConfig) {
    this.url = config.url;
    this.headers = { ...defaultHeaders, ...config.headers };
    this.batch = config.batch ?? false;
    this.batchSize = config.batchSize ?? 10;
    this.batchMs = config.batchMs ?? 2000;
  }

  send(entry: LogEntry): void {
    if (!this.batch) {
      this.post([entry]);
      return;
    }
    this.buffer.push(entry);
    if (this.buffer.length >= this.batchSize) {
      this.flush();
      return;
    }
    if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => {
        this.flushTimer = null;
        this.flush();
      }, this.batchMs);
    }
  }

  private flush(): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    if (this.buffer.length === 0) return;
    const batch = this.buffer.splice(0, this.batchSize);
    this.post(batch);
  }

  private post(payload: LogEntry | LogEntry[]): void {
    const body = Array.isArray(payload)
      ? JSON.stringify({ logs: payload.map((e) => JSON.parse(toJSON(e, false))) })
      : toJSON(payload, false);

    const f = typeof fetch !== "undefined" ? fetch : globalThis.fetch;
    if (typeof f !== "function") {
      return;
    }
    f(this.url, {
      method: "POST",
      headers: this.headers,
      body,
    }).catch(() => {});
  }
}
