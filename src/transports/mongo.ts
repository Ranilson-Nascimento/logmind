/**
 * Logmind – Transport MongoDB
 * Persiste logs em uma coleção. Requer driver Mongo (peer).
 */

import type { LogEntry, Transport } from "../types.js";
import { toJSON } from "../formatter.js";

export interface MongoTransportConfig {
  uri: string;
  collection?: string;
  db?: string;
}

interface MongoClientLike {
  db(name?: string): {
    collection(name: string): {
      insertOne(doc: object): Promise<unknown>;
    };
  };
}

export function createMongoTransport(config: MongoTransportConfig): Transport {
  const collectionName = config.collection ?? "logs";
  const dbName = config.db ?? "logmind";
  let client: MongoClientLike | null = null;
  let init: Promise<void> | null = null;

  async function getClient(): Promise<MongoClientLike> {
    if (client) return client;
    if (init) {
      await init;
      return client!;
    }
    init = (async () => {
      const mod = await import("mongodb");
      const { MongoClient } = mod;
      client = (await new MongoClient(config.uri).connect()) as unknown as MongoClientLike;
    })();
    await init;
    return client!;
  }

  return {
    async send(entry: LogEntry) {
      try {
        const c = await getClient();
        const doc = JSON.parse(toJSON(entry, false)) as object;
        await c.db(dbName).collection(collectionName).insertOne(doc);
      } catch {
        // evita recursão de log em falha de transporte
      }
    },
  };
}
