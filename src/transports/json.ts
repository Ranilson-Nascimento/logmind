/**
 * Logmind – Transport JSON (stdout)
 * Saída estrutural em JSON, uma linha por log.
 */

import { BaseTransport } from "./base.js";
import type { LogEntry } from "../types.js";
import { toJSON } from "../formatter.js";

export interface JsonTransportConfig {
  pretty?: boolean;
  stream?: NodeJS.WritableStream;
}

export class JsonTransport extends BaseTransport {
  private pretty: boolean;
  private stream: NodeJS.WritableStream | null;

  constructor(config: JsonTransportConfig = {}) {
    super();
    this.pretty = config.pretty ?? false;
    const stdout =
      typeof process !== "undefined" && process.stdout && typeof process.stdout.write === "function"
        ? process.stdout
        : null;
    this.stream = config.stream ?? stdout;
  }

  send(entry: LogEntry): void {
    const line = toJSON(entry, this.pretty) + "\n";
    if (this.stream) {
      this.stream.write(line);
    } else if (typeof console !== "undefined" && console.log) {
      console.log(line.trim());
    }
  }
}
