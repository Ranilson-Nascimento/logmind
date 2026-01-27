# Logmind

[![npm version](https://img.shields.io/npm/v/logmind.svg)](https://www.npmjs.com/package/logmind)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/Ranilson-Nascimento/logmind/actions/workflows/ci.yml/badge.svg)](https://github.com/Ranilson-Nascimento/logmind/actions/workflows/ci.yml)

Logger unificado, com contexto e diagnóstico automático. Node, browser e React Native. Uma API, zero complicação.

## O que oferece

- **Logs estruturados**: JSON com timestamp, ambiente, app, versão, contexto, dispositivo, origem e stack opcional.
- **Contexto automático**: `withContext({ userId, requestId }, () => { ... })` — todo log dentro do bloco herda o contexto.
- **Diagnóstico automático**: `log.auto(err)` classifica o erro (banco, rede, permissão, validação, timeout, conhecido) e adiciona dicas.
- **Modo produção**: Remove debug, agrupa erros repetidos e resume rajadas para não poluir stdout e reduzir custo de observabilidade.
- **Transports**: JSON (stdout), arquivo (com rotação), webhook, MongoDB, Elasticsearch, Firebase/Firestore. Use o que fizer sentido.

## Logmind vs outros

| | Logmind | Winston | Pino |
|--|--------|---------|------|
| **Contexto** | `withContext({ userId, requestId }, fn)` — logs dentro herdam | Manual / child loggers | Manual / bindings |
| **Diagnóstico** | `log.auto(err)` — category, hint, suggestedAction | Não | Não |
| **Node + Browser + RN** | Mesma API, um pacote | Foco Node | Foco Node |
| **JSON estruturado** | Sim | Via formatters | Sim |
| **Produção** | Remove debug, agrupa repetidos, `[repeated Nx]` | Configurável | Configurável |

## Instalação

```bash
npm install logmind
```

## Uso rápido

```js
import { initLogger, log } from "logmind";

initLogger({ app: "minha-api", version: "1.0.0" });

log.info("Serviço iniciado");
log.warn("Token próximo de expirar");
log.error("Falha ao salvar pedido", error);
```

## Contexto

```js
import { withContext, log } from "logmind";

withContext(
  { userId: "123", companyId: "456", requestId: "abc-xyz" },
  () => {
    log.info("Pedido criado");
    log.info("Pagamento processado", { orderId: "ord_789" });
  }
);
```

Todos os logs dentro do callback passam a incluir `userId`, `companyId` e `requestId` automaticamente.

## Diagnóstico automático

```js
log.auto(err);
```

O Logmind inspeciona o erro e preenche um campo `diagnosis`: `category` (database, network, permission, validation, timeout, known, unknown), `code` opcional, `hint` e `suggestedAction`. Nada de configuração extra.

## Transports

**JSON (padrão)** — stdout, uma linha JSON por log:

```js
initLogger({ app: "x", version: "1.0.0", transport: "json" });
```

**Arquivo** — append em arquivo com rotação opcional (apenas Node):

```js
initLogger({
  app: "x",
  version: "1.0.0",
  transport: "file",
  file: { path: "./logs/app.log", maxSize: "10m", maxFiles: 5 },
});
```

**Webhook** — envia cada log (ou em batch) para uma URL:

```js
initLogger({
  app: "x",
  version: "1.0.0",
  transport: "webhook",
  webhook: {
    url: "https://seu-ingest.example/logs",
    headers: { "X-API-Key": "..." },
    batch: true,
    batchSize: 10,
    batchMs: 2000,
  },
});
```

**MongoDB** — grava em uma coleção (apenas Node, peer `mongodb`):

```js
initLogger({
  app: "x",
  version: "1.0.0",
  transport: "mongo",
  mongo: { uri: "mongodb://...", collection: "logs", db: "mydb" },
});
```

**Elasticsearch** — indexa os logs:

```js
initLogger({
  app: "x",
  version: "1.0.0",
  transport: "elasticsearch",
  elasticsearch: {
    node: "https://...",
    index: "logmind-logs",
    auth: { username: "elastic", password: "..." },
  },
});
```

**Firebase / Firestore** — grava em uma coleção (apenas Node, peer `firebase-admin`):

```js
initLogger({
  app: "x",
  version: "1.0.0",
  transport: "firebase",
  firebase: { projectId: "meu-projeto", collection: "logs", credentials: {...} },
});
```

## Modo produção

Com `env === "production"` (ou `production: true`), o Logmind:

- Descarta logs `debug`.
- Mantém `info` e acima.
- Agrupa erros idênticos e, após um limite de repetições, emite um único resumo `[repeated Nx]` em vez de encher o pipe.

## React Native

```js
import { initReactNative, log } from "logmind/react-native";

initReactNative({ app: "meu-app", version: "1.0.0" });

log.info("Tela montada");
log.auto(err);
```

Use `transport: "json"` ou `"webhook"` no RN. Arquivo, Mongo e Firebase são apenas Node.

## Browser

```js
import { initBrowser, log } from "logmind/browser";

initBrowser({ app: "meu-app", version: "1.0.0", captureGlobalErrors: true });

log.info("Página carregada");
log.auto(err);
```

Com `captureGlobalErrors: true` (padrão), o Logmind registra `window.onerror` e `unhandledrejection` e faz log automático.

## API

| Export | Descrição |
|--------|-----------|
| `initLogger(opts)` | Configura app, versão, env, plataforma e transport. |
| `log` | `log.debug`, `log.info`, `log.warn`, `log.error`, `log.auto(err, message?, meta?)`. |
| `getLogger()` | O mesmo que `log`. |
| `withContext(ctx, fn)` | Executa `fn` com contexto; logs dentro herdam. |
| `withContextAsync(ctx, fn)` | Variante assíncrona para handlers de request. |
| `getContext` / `setContext` / `clearContext` | Acesso de baixo nível ao contexto. |
| `diagnose(err)` | Retorna `{ category, code?, hint?, suggestedAction? }`. |
| `createTransport(type, config)` | Monta um transport manualmente. |

## Desenvolvimento

```bash
npm install
npm run build
npm run test
npm run example:basic
npm run example:context
npm run example:diagnosis
```

**[Exemplos](examples/)** · [Como testar](TESTING.md)

## Versões e releases

O Logmind é publicado no [npm](https://www.npmjs.com/package/logmind). Novas versões saem quando o mantenedor atualiza a `version` no `package.json` e faz push. Instale a última com `npm install logmind`, ou uma versão específica com `npm install logmind@1.0.0`. O histórico está no [CHANGELOG](CHANGELOG.md).

## Licença

MIT.
