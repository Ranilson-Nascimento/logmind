/**
 * Exemplo: Express – withContext por request (requestId, userId).
 * Uso: npm install express && node examples/express-middleware.mjs
 *
 * Nota: withContext é síncrono. Para handlers async, o contexto pode
 * não propagar após o primeiro await. Use withContextAsync ou repasse
 * requestId/userId via req.
 */

import express from "express";
import { initLogger, log, withContext } from "../dist/index.js";
import { randomUUID } from "node:crypto";

initLogger({
  app: "express-api",
  version: "1.0.0",
  env: process.env.NODE_ENV || "development",
});

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  const requestId = req.headers["x-request-id"] || randomUUID();
  const userId = req.headers["x-user-id"] || "anonymous";
  withContext({ requestId, userId }, () => next());
});

app.get("/health", (req, res) => {
  log.info("Health check");
  res.json({ ok: true });
});

app.get("/orders/:id", (req, res) => {
  log.info("Pedido consultado", { orderId: req.params.id });
  res.json({ orderId: req.params.id, status: "ok" });
});

app.listen(3000, () => {
  log.info("Servidor em http://localhost:3000");
});
