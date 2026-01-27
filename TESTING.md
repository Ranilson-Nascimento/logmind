# Como testar o Logmind

Siga estes passos **na ordem** na pasta do projeto.

---

## 1. Instalar dependências e fazer o build

No terminal, na raiz do projeto (`logmind`):

```bash
npm install
npm run build
```

Você deve ver algo como:
```
ESM ⚡️ Build success
CJS ⚡️ Build success
DTS Build start
...
```

---

## 2. Exemplo básico (info, warn, error)

```bash
npm run example:basic
```

**O que faz:** Inicializa o logger, envia um `info`, um `warn` e um `error` (com stack).  
**Saída esperada:** Três linhas JSON no stdout, uma por log, com `level`, `message`, `timestamp`, `env`, `app`, `version`, etc.

---

## 3. Exemplo com contexto (`withContext`)

```bash
npm run example:context
```

**O que faz:** Define um contexto `userId`, `companyId`, `requestId` e faz log dentro e fora do bloco.  
**Saída esperada:** Três linhas JSON. As duas primeiras incluem `"context": { "userId": "usr_123", "companyId": "emp_456", "requestId": "req_abc-xyz" }`. A terceira (`Fora do contexto`) não tem contexto.

---

## 4. Exemplo de diagnóstico automático (`log.auto`)

```bash
npm run example:diagnosis
```

**O que faz:** Envia um erro `ECONNREFUSED` e um de validação. O Logmind classifica e adiciona `diagnosis` (category, hint, suggestedAction).  
**Saída esperada:** Dois logs `error` em JSON. O primeiro tem `"error": { "diagnosis": { "category": "database", ... } }`. O segundo, `"category": "validation"`.

---

## 5. Exemplo com transporte em arquivo (opcional)

```bash
npm run example:file
```

**O que faz:** Grava logs em `./logs/app.log` com rotação.  
**Saída esperada:** Nenhum output no terminal. Crie o arquivo `./logs/app.log` e confira as linhas JSON.

---

## 6. Exemplo Express (opcional)

Requer `express` (já está em devDependencies).

```bash
node examples/express-middleware.mjs
```

**O que faz:** Sobe um servidor em `http://localhost:3000`. Cada request recebe um `requestId` e `userId` no contexto.

**Como testar:**
- Abra outro terminal e execute:
  ```bash
  curl http://localhost:3000/health
  curl http://localhost:3000/orders/123
  ```
- No terminal do Express você verá linhas JSON com `context.requestId` e `context.userId`.

Para encerrar o servidor: `Ctrl+C`.

---

## 7. Testar no seu próprio script

Crie um arquivo `meu-teste.mjs` na raiz:

```js
import { initLogger, log, withContext } from "./dist/index.js";

initLogger({ app: "meu-teste", version: "1.0.0" });

log.info("Olá, Logmind!");

withContext({ userId: "u1", requestId: "r1" }, () => {
  log.info("Dentro do contexto");
});

log.info("Fim");
```

Execute:

```bash
node meu-teste.mjs
```

Você deve ver três linhas JSON no terminal.

---

## Resumo dos comandos

| Comando | Descrição |
|--------|-----------|
| `npm install` | Instala dependências |
| `npm run build` | Gera `dist/` (sempre rode antes dos exemplos) |
| `npm run example:basic` | Logs básicos |
| `npm run example:context` | Contexto automático |
| `npm run example:diagnosis` | Diagnóstico de erros |
| `npm run example:file` | Log em arquivo |
| `node examples/express-middleware.mjs` | API Express com contexto |

Se algo falhar, confira que você rodou `npm run build` e que está na pasta **logmind** ao executar os comandos.
