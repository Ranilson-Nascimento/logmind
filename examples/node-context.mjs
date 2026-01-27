/**
 * Exemplo: contexto automático com withContext.
 * Todo log dentro do bloco herda userId, requestId, etc.
 */

import { initLogger, log, withContext } from "../dist/index.js";

initLogger({
  app: "api-pedidos",
  version: "1.0.0",
  transport: "json",
});

withContext(
  {
    userId: "usr_123",
    companyId: "emp_456",
    requestId: "req_abc-xyz",
  },
  () => {
    log.info("Pedido criado");
    log.info("Pagamento processado", { orderId: "ord_789" });
  }
);

log.info("Fora do contexto");
