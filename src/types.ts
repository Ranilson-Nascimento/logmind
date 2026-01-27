/**
 * Logmind – Core types
 * Tipos compartilhados entre transporte, diagnóstico e logger.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export type Platform = "node" | "browser" | "react-native";

export interface LogContext {
  userId?: string;
  companyId?: string;
  requestId?: string;
  sessionId?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface DeviceInfo {
  platform?: string;
  os?: string;
  osVersion?: string;
  appVersion?: string;
  userAgent?: string;
  [key: string]: string | undefined;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  env: string;
  app?: string;
  version?: string;
  context?: LogContext;
  device?: DeviceInfo;
  origin?: Platform;
  stack?: string;
  error?: {
    name: string;
    message: string;
    code?: string;
    stack?: string;
    diagnosis?: DiagnosisResult;
  };
  meta?: Record<string, unknown>;
}

export type DiagnosisCategory =
  | "database"
  | "network"
  | "permission"
  | "validation"
  | "timeout"
  | "known"
  | "unknown";

export interface DiagnosisResult {
  category: DiagnosisCategory;
  code?: string;
  hint?: string;
  suggestedAction?: string;
}

export type TransportType =
  | "json"
  | "file"
  | "webhook"
  | "mongo"
  | "elasticsearch"
  | "firebase"
  | "sentry";

export interface TransportConfigMap {
  json: { pretty?: boolean };
  file: { path: string; maxSize?: string; maxFiles?: number };
  webhook: { url: string; headers?: Record<string, string> };
  mongo: { uri: string; collection?: string; db?: string };
  elasticsearch: { node: string; index?: string };
  firebase: { projectId: string; collection?: string; credentials?: object };
  sentry: { dsn: string; environment?: string };
}

export interface InitOptions {
  app?: string;
  version?: string;
  env?: string;
  platform?: Platform;
  transport?: TransportType | Transport;
  production?: boolean;
  device?: DeviceInfo | (() => DeviceInfo);
  /** Config do transporte quando transport é string (ex: "mongo" -> mongo: { uri, collection }). */
  mongo?: { uri: string; collection?: string; db?: string };
  file?: { path: string; maxSize?: string; maxFiles?: number };
  webhook?: { url: string; headers?: Record<string, string>; batch?: boolean; batchSize?: number; batchMs?: number };
  elasticsearch?: { node: string; index?: string; auth?: { username: string; password: string } };
  firebase?: { projectId: string; collection?: string; credentials?: object };
}

export interface Transport {
  send(entry: LogEntry): void | Promise<void>;
}

export type TransportFactory = (
  config: unknown
) => Transport | Promise<Transport>;
