/**
 * Logmind – Transport File
 * Grava logs em arquivo. Rotação opcional (tamanho/número de arquivos).
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { BaseTransport } from "./base.js";
import type { LogEntry } from "../types.js";
import { toJSON } from "../formatter.js";

export interface FileTransportConfig {
  path: string;
  maxSize?: string;
  maxFiles?: number;
}

const DEFAULT_MAX_SIZE = "10m";
const DEFAULT_MAX_FILES = 5;

function parseSize(s: string): number {
  const m = s.trim().match(/^(\d+(?:\.\d+)?)\s*([kmg])?$/i);
  if (!m) return 10 * 1024 * 1024;
  let n = Number(m[1]);
  const u = (m[2] ?? "").toLowerCase();
  if (u === "k") n *= 1024;
  else if (u === "m") n *= 1024 * 1024;
  else if (u === "g") n *= 1024 * 1024 * 1024;
  return Math.floor(n);
}

export class FileTransport extends BaseTransport {
  private filePath: string;
  private maxSize: number;
  private maxFiles: number;
  private currentSize = 0;

  constructor(config: FileTransportConfig) {
    super();
    this.filePath = config.path;
    this.maxSize = parseSize(config.maxSize ?? DEFAULT_MAX_SIZE);
    this.maxFiles = config.maxFiles ?? DEFAULT_MAX_FILES;
    this.ensureDir();
  }

  private ensureDir(): void {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private rotate(): void {
    if (!fs.existsSync(this.filePath)) return;
    const stat = fs.statSync(this.filePath);
    if (stat.size < this.maxSize) return;

    const base = this.filePath;
    const ext = path.extname(base);
    const name = path.basename(base, ext);
    const dir = path.dirname(base);

    for (let i = this.maxFiles - 1; i >= 1; i--) {
      const from = path.join(dir, `${name}.${i}${ext}`);
      const to = path.join(dir, `${name}.${i + 1}${ext}`);
      if (fs.existsSync(from)) {
        fs.renameSync(from, to);
      }
    }
    const first = path.join(dir, `${name}.1${ext}`);
    fs.renameSync(this.filePath, first);
    this.currentSize = 0;
  }

  send(entry: LogEntry): void {
    this.rotate();
    const line = toJSON(entry, false) + "\n";
    fs.appendFileSync(this.filePath, line, "utf8");
    this.currentSize += Buffer.byteLength(line, "utf8");
  }
}
