/**
 * Exemplo: transport webhook. Requer um servidor que receba POST (ex: echo server).
 * Este script inicia um mini echo server na porta 9999 e configura o logger para enviar logs para ele.
 *
 * Run: node examples/node-webhook-echo.mjs
 */

import http from "node:http";
import { initLogger, log } from "../dist/index.js";

const ECHO_PORT = 9999;

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/logs") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ received: true, payload: body.slice(0, 200) + "…" }));
    });
    return;
  }
  res.writeHead(404);
  res.end();
});

server.listen(ECHO_PORT, () => {
  initLogger({
    app: "webhook-demo",
    version: "1.0.0",
    transport: "webhook",
    webhook: {
      url: `http://127.0.0.1:${ECHO_PORT}/logs`,
      headers: { "X-API-Key": "demo" },
      batch: false,
    },
  });

  log.info("Log sent to webhook (echo server on port " + ECHO_PORT + ")");
  log.warn("Another log line");

  setTimeout(() => {
    server.close();
    process.exit(0);
  }, 500);
});
