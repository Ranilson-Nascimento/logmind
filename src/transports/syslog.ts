/**
 * Logmind – Syslog transport (Node only)
 * Sends logs via UDP or TCP to a syslog server.
 */

import type { LogEntry, Transport } from "../types.js";
import { toJSON } from "../formatter.js";

export interface SyslogTransportConfig {
  host: string;
  port?: number;
  facility?: number;
  protocol?: "udp" | "tcp";
}

const SYSLOG_PORT = 514;
const DEFAULT_FACILITY = 16; // local0

function severityPriority(level: string): number {
  switch (level) {
    case "debug":
      return 7;
    case "info":
      return 6;
    case "warn":
      return 4;
    case "error":
      return 3;
    default:
      return 6;
  }
}

function formatSyslogMessage(entry: LogEntry, facility: number): string {
  const pri = (facility << 3) | severityPriority(entry.level);
  const timestamp = new Date(entry.timestamp).toISOString();
  const hostname = typeof process !== "undefined" && process.env?.HOSTNAME ? process.env.HOSTNAME : "logmind";
  const app = entry.app ?? "logmind";
  const body = toJSON(entry, false).replace(/\n/g, " ");
  return `<${pri}>${timestamp} ${hostname} ${app}: ${body}`;
}

export function createSyslogTransport(config: SyslogTransportConfig): Transport {
  const port = config.port ?? SYSLOG_PORT;
  const facility = config.facility ?? DEFAULT_FACILITY;
  const protocol = config.protocol ?? "udp";
  const host = config.host;

  if (protocol === "tcp") {
    return {
      send(entry: LogEntry) {
        try {
          const net = require("node:net") as typeof import("node:net");
          const msg = formatSyslogMessage(entry, facility) + "\n";
          const socket = net.createConnection({ host, port }, () => {
            socket.write(msg, () => socket.end());
          });
          socket.on("error", () => {});
        } catch {
          // avoid recursion
        }
      },
    };
  }

  return {
    send(entry: LogEntry) {
      try {
        const dgram = require("node:dgram") as typeof import("node:dgram");
        const client = dgram.createSocket("udp4");
        const msg = Buffer.from(formatSyslogMessage(entry, facility), "utf8");
        client.send(msg, port, host, () => {
          client.close();
        });
        client.on("error", () => {
          client.close();
        });
      } catch {
        // avoid recursion
      }
    },
  };
}
