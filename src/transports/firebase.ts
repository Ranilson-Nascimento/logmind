/**
 * Logmind – Transport Firebase / Firestore
 * Envia logs para uma coleção Firestore. Requer firebase-admin ou SDK (peer).
 */

import type { LogEntry, Transport } from "../types.js";
import { toJSON } from "../formatter.js";

export interface FirebaseTransportConfig {
  projectId: string;
  collection?: string;
  credentials?: object;
}

export function createFirebaseTransport(config: FirebaseTransportConfig): Transport {
  const collectionName = config.collection ?? "logs";
  let firestore: { collection: (n: string) => { add: (d: object) => Promise<unknown> } } | null = null;
  let init: Promise<void> | null = null;

  async function getFirestore() {
    if (firestore) return firestore;
    if (init) {
      await init;
      return firestore!;
    }
    init = (async () => {
      const mod = await import("firebase-admin");
      if (!mod.apps.length) {
        mod.initializeApp({
          projectId: config.projectId,
          credential: config.credentials ? mod.credential.cert(config.credentials as object) : undefined,
        });
      }
      firestore = mod.firestore() as unknown as typeof firestore;
    })();
    await init;
    return firestore!;
  }

  return {
    async send(entry: LogEntry) {
      try {
        const fs = await getFirestore();
        const doc = JSON.parse(toJSON(entry, false)) as object;
        await fs.collection(collectionName).add(doc);
      } catch {
        // evita recursão
      }
    },
  };
}
