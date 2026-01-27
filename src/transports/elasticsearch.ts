/**
 * Logmind – Transport Elasticsearch
 * Indexa logs. Requer cliente ES ou fetch para HTTP.
 */

import type { LogEntry, Transport } from "../types.js";
import { toJSON } from "../formatter.js";

export interface ElasticsearchTransportConfig {
  node: string;
  index?: string;
  auth?: { username: string; password: string };
}

const INDEX_PREFIX = "logmind";

function getIndexName(base?: string): string {
  if (base) return base;
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, ".");
  return `${INDEX_PREFIX}-${today}`;
}

export function createElasticsearchTransport(
  config: ElasticsearchTransportConfig
): Transport {
  const index = config.index ?? getIndexName();
  const base = config.node.replace(/\/$/, "");
  const auth = config.auth;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (auth) {
    const b = Buffer.from(`${auth.username}:${auth.password}`, "utf8").toString("base64");
    headers.Authorization = `Basic ${b}`;
  }

  return {
    async send(entry: LogEntry) {
      try {
        const body = JSON.parse(toJSON(entry, false));
        const url = `${base}/${index}/_doc`;
        const f = typeof fetch !== "undefined" ? fetch : (globalThis as { fetch?: typeof fetch }).fetch;
        if (typeof f !== "function") return;
        await f(url, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });
      } catch {
        // evita recursão
      }
    },
  };
}
