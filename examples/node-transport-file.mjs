/**
 * Exemplo: transporte em arquivo com rotação.
 */

import { initLogger, log } from "../dist/index.js";

initLogger({
  app: "file-log-demo",
  version: "1.0.0",
  transport: "file",
  file: {
    path: "./logs/app.log",
    maxSize: "10m",
    maxFiles: 5,
  },
});

log.info("Log gravado em arquivo");
