/**
 * Logmind – Config file loader (Node only)
 * Load logmind.config.json from cwd and merge with init options.
 */

import type { InitOptions } from "./types.js";

const CONFIG_NAME = "logmind.config.json";

export interface LogmindConfigFile {
  app?: string;
  version?: string;
  env?: string;
  transport?: InitOptions["transport"];
  redact?: InitOptions["redact"];
  sampling?: InitOptions["sampling"];
  rateLimit?: InitOptions["rateLimit"];
  production?: boolean;
  file?: InitOptions["file"];
  webhook?: InitOptions["webhook"];
  mongo?: InitOptions["mongo"];
  elasticsearch?: InitOptions["elasticsearch"];
  firebase?: InitOptions["firebase"];
  otlp?: InitOptions["otlp"];
  syslog?: InitOptions["syslog"];
  [key: string]: unknown;
}

/**
 * Load config from logmind.config.json in the given directory (default: process.cwd()).
 * Returns merged options: file as base, opts override. Returns opts only if no file or not Node.
 */
export function loadConfig(opts: InitOptions = {}, cwd?: string): InitOptions {
  if (typeof process === "undefined" || !process.cwd) return opts;
  let readFile: (path: string) => string;
  let join: (a: string, b: string) => string;
  let exists: (path: string) => boolean;
  try {
    const fs = require("node:fs") as { existsSync: (p: string) => boolean; readFileSync: (p: string, enc?: string) => string };
    const path = require("node:path") as { join: (...a: string[]) => string };
    exists = fs.existsSync;
    readFile = (p: string) => fs.readFileSync(p, "utf8");
    join = path.join;
  } catch {
    return opts;
  }
  const dir = cwd ?? process.cwd();
  const full = join(dir, CONFIG_NAME);
  if (!exists(full)) return opts;
  try {
    const content = readFile(full);
    const fileConfig = JSON.parse(content) as LogmindConfigFile;
    return {
      ...fileConfig,
      ...opts,
      redact: opts.redact ?? fileConfig.redact,
      sampling: opts.sampling ?? fileConfig.sampling,
      rateLimit: opts.rateLimit ?? fileConfig.rateLimit,
      file: opts.file ?? fileConfig.file,
      webhook: opts.webhook ?? fileConfig.webhook,
      mongo: opts.mongo ?? fileConfig.mongo,
      elasticsearch: opts.elasticsearch ?? fileConfig.elasticsearch,
      firebase: opts.firebase ?? fileConfig.firebase,
      otlp: opts.otlp ?? fileConfig.otlp,
      syslog: opts.syslog ?? fileConfig.syslog,
    };
  } catch {
    return opts;
  }
}
