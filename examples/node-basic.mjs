/**
 * Exemplo mínimo: Node.js, JSON no stdout.
 * Run: node examples/node-basic.mjs
 */

import { initLogger, log } from "../dist/index.js";

initLogger({
  app: "exemplo-node",
  version: "1.0.0",
  env: "development",
});

log.info("Serviço iniciado");
log.warn("Token próximo de expirar");
log.error("Falha ao salvar pedido", new Error("Connection refused"));
