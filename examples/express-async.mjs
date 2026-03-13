/**
 * Exemplo: Express com withContextAsync – contexto propagado em handlers assíncronos.
 * Uso: npm install express && node examples/express-async.mjs
 *
 * withContextAsync garante que todo log dentro do handler (incluindo após await)
 * herda requestId e userId.
 */

import express from "express";
import { initLogger, log, withContextAsync } from "../dist/index.js";
import { randomUUID } from "node:crypto";

initLogger({
  app: "express-async-api",
  version: "1.0.0",
  env: process.env.NODE_ENV || "development",
});

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
  log.info("Health check");
  res.json({ ok: true });
});

app.get("/orders/:id", (req, res) => {
  const requestId = req.headers["x-request-id"] || randomUUID();
  const userId = req.headers["x-user-id"] || "anonymous";

  withContextAsync({ requestId, userId }, async () => {
    log.info("Order request started", { orderId: req.params.id });
    // Simula trabalho assíncrono; o contexto continua nos logs
    await new Promise((r) => setTimeout(r, 50));
    log.info("Order fetched");
    res.json({ orderId: req.params.id, status: "ok" });
  });
});

app.listen(3001, () => {
  log.info("Servidor async em http://localhost:3001 – GET /orders/123");
});
