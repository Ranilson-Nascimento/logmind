/**
 * Logmind – OTLP HTTP transport
 * Sends logs to an OpenTelemetry collector or backend (e.g. Grafana, Honeycomb).
 */

import type { LogEntry, Transport } from "../types.js";

export interface OtlpTransportConfig {
  url: string;
  headers?: Record<string, string>;
  serviceName?: string;
}

const DEFAULT_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
};

/** Map LogEntry to OTLP LogRecord-like payload (HTTP JSON). */
function toOtlpBody(entry: LogEntry, serviceName?: string): string {
  const logRecord = {
    timeUnixNano: new Date(entry.timestamp).getTime() + "000000",
    severityNumber: severityNumber(entry.level),
    severityText: entry.level.toUpperCase(),
    body: { stringValue: entry.message },
    attributes: [
      { key: "level", value: { stringValue: entry.level } },
      { key: "env", value: { stringValue: entry.env } },
      ...(entry.app ? [{ key: "app", value: { stringValue: entry.app } }] : []),
      ...(entry.version ? [{ key: "version", value: { stringValue: entry.version } }] : []),
      ...(entry.context
        ? Object.entries(entry.context).map(([k, v]) => ({
            key: "context." + k,
            value: { stringValue: String(v) },
          }))
        : []),
      ...(entry.error
        ? [
            { key: "error.name", value: { stringValue: entry.error.name } },
            { key: "error.message", value: { stringValue: entry.error.message } },
            ...(entry.error.diagnosis
              ? [{ key: "diagnosis.category", value: { stringValue: entry.error.diagnosis.category } }]
              : []),
          ]
        : []),
    ].filter(Boolean),
  };
  const resource = {
    attributes: [
      { key: "service.name", value: { stringValue: serviceName ?? entry.app ?? "logmind" } },
    ],
  };
  const payload = {
    resourceLogs: [
      {
        resource,
        scopeLogs: [{ logRecords: [logRecord] }],
      },
    ],
  };
  return JSON.stringify(payload);
}

function severityNumber(level: string): number {
  switch (level) {
    case "debug":
      return 5;
    case "info":
      return 9;
    case "warn":
      return 13;
    case "error":
      return 17;
    default:
      return 9;
  }
}

export function createOtlpTransport(config: OtlpTransportConfig): Transport {
  const url = config.url.replace(/\/$/, "");
  const headers = { ...DEFAULT_HEADERS, ...config.headers };
  const serviceName = config.serviceName;

  return {
    async send(entry: LogEntry) {
      try {
        const body = toOtlpBody(entry, serviceName);
        const f = typeof fetch !== "undefined" ? fetch : (globalThis as { fetch?: typeof fetch }).fetch;
        if (typeof f !== "function") return;
        await f(`${url}/v1/logs`, {
          method: "POST",
          headers,
          body,
        });
      } catch {
        // avoid recursion on transport failure
      }
    },
  };
}
