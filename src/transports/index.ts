/**
 * Logmind – Transports
 * Fábricas e registro de transportes.
 */

import type { Transport, TransportType } from "../types.js";
import { JsonTransport } from "./json.js";
import { FileTransport } from "./file.js";
import { WebhookTransport } from "./webhook.js";
import { createMongoTransport } from "./mongo.js";
import { createElasticsearchTransport } from "./elasticsearch.js";
import { createFirebaseTransport } from "./firebase.js";

export { JsonTransport } from "./json.js";
export { FileTransport } from "./file.js";
export { WebhookTransport } from "./webhook.js";
export { createMongoTransport } from "./mongo.js";
export { createElasticsearchTransport } from "./elasticsearch.js";
export { createFirebaseTransport } from "./firebase.js";

export type { JsonTransportConfig } from "./json.js";
export type { FileTransportConfig } from "./file.js";
export type { WebhookTransportConfig } from "./webhook.js";
export type { MongoTransportConfig } from "./mongo.js";
export type { ElasticsearchTransportConfig } from "./elasticsearch.js";
export type { FirebaseTransportConfig } from "./firebase.js";

export interface TransportConfigMap {
  json?: { pretty?: boolean; stream?: NodeJS.WritableStream };
  file?: { path: string; maxSize?: string; maxFiles?: number };
  webhook?: { url: string; headers?: Record<string, string>; batch?: boolean; batchSize?: number; batchMs?: number };
  mongo?: { uri: string; collection?: string; db?: string };
  elasticsearch?: { node: string; index?: string; auth?: { username: string; password: string } };
  firebase?: { projectId: string; collection?: string; credentials?: object };
}

export function createTransport(
  type: "json",
  config?: TransportConfigMap["json"]
): Transport;
export function createTransport(
  type: "file",
  config: TransportConfigMap["file"]
): Transport;
export function createTransport(
  type: "webhook",
  config: TransportConfigMap["webhook"]
): Transport;
export function createTransport(
  type: "mongo",
  config: TransportConfigMap["mongo"]
): Transport;
export function createTransport(
  type: "elasticsearch",
  config: TransportConfigMap["elasticsearch"]
): Transport;
export function createTransport(
  type: "firebase",
  config: TransportConfigMap["firebase"]
): Transport;
export function createTransport(type: TransportType | string, config?: unknown): Transport;
export function createTransport(
  type: TransportType | string,
  config?: unknown
): Transport {
  switch (type) {
    case "json":
      return new JsonTransport((config as TransportConfigMap["json"]) ?? {});
    case "file":
      return new FileTransport(config as TransportConfigMap["file"] & { path: string });
    case "webhook":
      return new WebhookTransport(config as TransportConfigMap["webhook"] & { url: string }) as unknown as Transport;
    case "mongo":
      return createMongoTransport(config as TransportConfigMap["mongo"] & { uri: string });
    case "elasticsearch":
      return createElasticsearchTransport(config as TransportConfigMap["elasticsearch"] & { node: string });
    case "firebase":
      return createFirebaseTransport(config as TransportConfigMap["firebase"] & { projectId: string });
    default:
      return new JsonTransport({});
  }
}
