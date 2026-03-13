/**
 * Exemplo: modo produção – remove debug, agrupa erros repetidos e emite [repeated Nx].
 * Run: node examples/node-production.mjs
 */

import { initLogger, log } from "../dist/index.js";

initLogger({
  app: "production-demo",
  version: "1.0.0",
  env: "production",
  production: true,
  transport: "json",
});

// debug é descartado em produção
log.debug("This will not appear");

log.info("Service started (info is kept)");
log.warn("Token expiring soon");

// Simula vários erros iguais: após um limite, Logmind emite [repeated Nx] e suprime os seguintes
const err = new Error("Connection refused");
err.code = "ECONNREFUSED";

for (let i = 0; i < 8; i++) {
  log.error("DB connection failed", err);
}

console.error("\n(Check stdout: first errors appear, then [repeated Nx], then suppression.)");
