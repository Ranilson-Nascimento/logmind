/**
 * Exemplo: log.auto(error) – diagnóstico automático.
 * Classifica: banco, rede, permissão, validação, timeout, conhecidos.
 */

import { initLogger, log } from "../dist/index.js";

initLogger({ app: "diagnosis-demo", version: "1.0.0" });

const err = new Error("connect ECONNREFUSED 127.0.0.1:27017");
err.code = "ECONNREFUSED";

log.auto(err);
log.auto(new Error("Validation failed: email is required"), "Validação falhou");
