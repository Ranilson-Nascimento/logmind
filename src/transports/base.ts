/**
 * Logmind – Transport base
 * Interface comum e helpers para todos os transports.
 */

import type { LogEntry, Transport } from "../types.js";
import { toJSON } from "../formatter.js";

export abstract class BaseTransport implements Transport {
  abstract send(entry: LogEntry): void | Promise<void>;

  protected format(entry: LogEntry, pretty = false): string {
    return toJSON(entry, pretty);
  }
}
