# Logmind

[![npm version](https://img.shields.io/npm/v/logmind.svg)](https://www.npmjs.com/package/logmind)
[![bundle size](https://img.shields.io/bundlephobia/minzip/logmind)](https://www.npmjs.com/package/logmind)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/Ranilson-Nascimento/logmind/actions/workflows/ci.yml/badge.svg)](https://github.com/Ranilson-Nascimento/logmind/actions/workflows/ci.yml)

**🇧🇷 Português (pt-BR)** · **🇺🇸 [English](README.md)**

**Logger unificado, com contexto e diagnóstico automático para Node, browser e React Native. Uma API, zero complicação.**

### Por que usar o Logmind?

- **Um logger para o stack inteiro**: Mesma API em Node, browser e React Native.
- **Contexto propagado automaticamente**: Anexe `userId`, `requestId`, `tenantId` uma vez e tenha isso em todos os logs.
- **Diagnóstico automático de erros**: `log.auto(err)` classifica (banco, rede, permissão, validação, timeout, conhecido) e adiciona dica + ação sugerida.
- **Pronto para produção**: Remove `debug` em produção, agrupa erros repetidos e resume rajadas de eventos.
- **Transports plugáveis**: JSON (stdout), arquivo, webhook, MongoDB, Elasticsearch, Firebase/Firestore – use só o que precisar.

---

### Índice

- **Visão geral**
  - [Instalação](#instalação)
  - [Uso rápido (Node)](#uso-rápido-node)
  - [Browser e React Native](#browser-e-react-native)
- **Conceitos principais**
  - [Contexto](#contexto)
  - [Diagnóstico automático (`log.auto`)](#diagnóstico-automático-logauto)
  - [Transports](#transports)
  - [Modo produção](#modo-produção)
- **API**
  - [API principal](#api)
  - [Helpers de plataforma](#helpers-de-plataforma)
- **Projeto**
  - [Demo ao vivo](#demo-ao-vivo)
  - [Exemplos](#exemplos)
  - [Desenvolvimento e testes](#desenvolvimento)
  - [Versões e releases](#versões-e-releases)
  - [Licença](#licença)

---

## Instalação

```bash
npm install logmind
# ou
yarn add logmind
```

## Uso rápido (Node)

```js
import { initLogger, log } from "logmind";

initLogger({
  app: "minha-api",
  version: "1.0.0",
  env: process.env.NODE_ENV,
});

log.info("Serviço iniciado");
log.warn("Token próximo de expirar");

try {
  // ... seu código
} catch (error) {
  log.error("Falha ao salvar pedido", error, { orderId: "ord_123" });
  log.auto(error);
}
```

## Browser e React Native

### Browser

```js
import { initBrowser, log } from "logmind/browser";

initBrowser({
  app: "meu-webapp",
  version: "1.0.0",
  captureGlobalErrors: true, // registra window.onerror + unhandledrejection
});

log.info("Página carregada");
log.auto(new Error("Erro de teste no browser"));
```

### React Native

```js
import { initReactNative, log } from "logmind/react-native";

initReactNative({
  app: "meu-app-rn",
  version: "1.0.0",
});

log.info("Tela montada");
log.auto(err);
```

Use `transport: "json"` ou `"webhook"` no React Native. Arquivo, Mongo e Firebase são apenas para Node.

---

## O que oferece

- **Logs estruturados**: JSON com timestamp, ambiente, app, versão, contexto, dispositivo, origem e stack opcional.
- **Contexto automático**: `withContext({ userId, requestId }, () => { ... })` — todo log dentro do bloco herda o contexto.
- **Diagnóstico automático**: `log.auto(err)` classifica erro (banco, rede, permissão, validação, timeout, conhecido) e adiciona dica.
- **Modo produção**: Remove debug, agrupa erros repetidos e resume rajadas para não poluir stdout e reduzir custo de observabilidade.
- **Transports**: JSON (stdout), arquivo (com rotação), webhook, MongoDB, Elasticsearch, Firebase/Firestore.

---

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

### Handlers assíncronos

Para rotas HTTP e fluxos assíncronos, use `withContextAsync`:

```ts
import { withContextAsync, log } from "logmind";

app.post("/orders", (req, res) => {
  withContextAsync(
    { userId: req.user.id, requestId: req.id },
    async () => {
      log.info("Criando pedido");
      // await createOrder(...)
      log.info("Pedido criado");
      res.sendStatus(201);
    }
  );
});
```

Você também pode usar `getContext`, `setContext` e `clearContext` para controlar o contexto manualmente quando precisar.

---

## Diagnóstico automático (`log.auto`)

```js
try {
  await chamarServicoExterno();
} catch (err) {
  log.auto(err, "Serviço externo falhou", { service: "payments" });
}
```

O Logmind inspeciona o erro e preenche `error.diagnosis` no log:

- **category**: `database`, `network`, `permission`, `validation`, `timeout`, `known`, `unknown`
- **code** (opcional): código do erro quando existir
- **hint**: explicação curta e humana
- **suggestedAction**: próximo passo sugerido

Funciona direto, sem configuração extra ou schema.

---

## Transports

### JSON (padrão)

Stdout, uma linha JSON por log:

```js
initLogger({
  app: "x",
  version: "1.0.0",
  transport: "json",
});
```

### Arquivo (Node)

Append em arquivo com rotação opcional:

```js
initLogger({
  app: "x",
  version: "1.0.0",
  transport: "file",
  file: { path: "./logs/app.log", maxSize: "10m", maxFiles: 5 },
});
```

### Webhook

Envia cada log (ou batch) para uma URL:

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

### MongoDB (Node, peer `mongodb`)

```js
initLogger({
  app: "x",
  version: "1.0.0",
  transport: "mongo",
  mongo: { uri: "mongodb://...", collection: "logs", db: "mydb" },
});
```

### Elasticsearch

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

### Firebase / Firestore (Node, peer `firebase-admin`)

```js
initLogger({
  app: "x",
  version: "1.0.0",
  transport: "firebase",
  firebase: {
    projectId: "meu-projeto",
    collection: "logs",
    credentials: { /* service account */ },
  },
});
```

---

## Modo produção

Com `env === "production"` (ou `production: true`), o Logmind:

- Descarta logs `debug`.
- Mantém `info` e acima.
- Agrupa erros idênticos e, após um limite, emite um único log de resumo `[repeated Nx]` em vez de inundar o output.

Isso ajuda a manter stdout limpo e reduz custos de observabilidade.

---

## Logmind vs outros

|                         | Logmind                                                    | Winston                    | Pino                    |
|-------------------------|------------------------------------------------------------|----------------------------|-------------------------|
| **Contexto**            | `withContext({ userId, requestId }, fn)` – automático      | Manual / child loggers     | Manual / bindings       |
| **Diagnóstico**         | `log.auto(err)` → category, hint, suggestedAction          | Não                         | Não                      |
| **Node + Browser + RN** | Mesma API, um pacote                                      | Foco em Node               | Foco em Node            |
| **JSON estruturado**    | Sim                                                       | Via formatters             | Sim                     |
| **Produção**            | Remove debug, agrupa repetidos, `[repeated Nx]`            | Configurável               | Configurável            |

---

## API

### API principal

| Export | Descrição |
|--------|-----------|
| `initLogger(opts)` | Configura app, versão, env, plataforma e transport. |
| `log` | Instância de logger com `log.debug`, `log.info`, `log.warn`, `log.error`, `log.auto(err, message?, meta?)`. |
| `getLogger()` | Retorna a mesma instância de logger que `log`. |
| `withContext(ctx, fn)` | Executa `fn` com contexto; logs dentro herdam. |
| `withContextAsync(ctx, fn)` | Variante assíncrona para handlers de request e fluxos assíncronos. |
| `getContext` / `setContext` / `clearContext` | Acesso de baixo nível ao contexto. |
| `diagnose(err)` | Retorna `{ category, code?, hint?, suggestedAction? }`. |
| `createTransport(type, config)` | Monta um transport manualmente. |

### Helpers de plataforma

- `logmind/browser` – `initBrowser(options)` + `log`
- `logmind/react-native` – `initReactNative(options)` + `log`

Ambos compartilham a mesma semântica de logger da entrada principal (Node).

---

## Demo ao vivo

### Demo online (GitHub Pages)

Você pode testar o Logmind sem clonar o repositório usando a demo hospedada:

- **GitHub Pages**: `https://ranilson-nascimento.github.io/logmind/demo/`

### Rodar localmente

Uma **demo no browser** permite testar o Logmind no navegador: logger ao vivo, contexto e diagnóstico automático com erros de exemplo.

1. Na raiz do repositório: `npm run build && npx serve . -p 5000`
2. Abra **http://localhost:5000/docs/demo/** no navegador.

Você também pode abrir `docs/demo/index.html` após o build e servir com qualquer servidor estático.

---

## Exemplos

Os exemplos ficam neste repositório (não são publicados no pacote npm) para manter o artefato leve.

**Configuração (uma vez):**

```bash
git clone https://github.com/Ranilson-Nascimento/logmind.git
cd logmind
npm install
npm run build
```

**Exemplos disponíveis:**

| Script | Descrição |
|--------|-----------|
| `npm run example:basic` | Node mínimo: init + níveis de log |
| `npm run example:context` | `withContext` – logs herdam userId, requestId |
| `npm run example:diagnosis` | `log.auto(err)` – amostras de banco, rede, validação |
| `npm run example:file` | Transport em arquivo com rotação |
| `npm run example:production` | Modo produção: debug removido, erros repetidos resumidos |
| `npm run example:webhook` | Transport webhook (inicia um mini echo server) |
| `npm run example:express` | Express com middleware de contexto síncrono |
| `npm run example:express-async` | Express com `withContextAsync` para handlers assíncronos |

---

## Desenvolvimento

```bash
npm install
npm run build
npm run test
npm run demo
```

Exemplos: `npm run example:basic`, `example:context`, `example:diagnosis`, `example:file`, `example:production`, `example:webhook`, `example:express`, `example:express-async`.

Veja `TESTING.md` para detalhes. Contribuições são bem‑vindas via pull requests e issues.

---

## Versões e releases

O Logmind é publicado no [`npm` (`logmind`)](https://www.npmjs.com/package/logmind). Novas versões saem quando a `version` no `package.json` é atualizada e o código é enviado. Para instalar a versão mais recente:

```bash
npm install logmind
```

ou uma versão específica:

```bash
npm install logmind@1.0.0
```

O histórico está em `CHANGELOG.md`.

---

## Licença

MIT.

---

## Localização

Este repositório mantém esta tradução oficial em português em `README.pt-BR.md`. Ao atualizar o `README.md` em inglês para uma nova release, atualize também o `README.pt-BR.md` para manter os documentos sincronizados.
