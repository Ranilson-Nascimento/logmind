/**
 * Logmind – Auto-diagnóstico
 * Classifica erros (DB, rede, permissão, validação, timeout, conhecidos).
 */

import type { DiagnosisResult } from "../types.js";

const DB_CODES = new Set([
  "ECONNREFUSED",
  "ETIMEDOUT",
  "ENOTFOUND",
  "ER_ACCESS_DENIED_ERROR",
  "ER_BAD_DB_ERROR",
  "ER_NO_SUCH_TABLE",
  "ER_DUP_ENTRY",
  "ER_LOCK_WAIT_TIMEOUT",
  "ER_LOCK_DEADLOCK",
  "MongoServerError",
  "MongoNetworkError",
  "MongoTimeoutError",
  "PrismaClientKnownRequestError",
  "P2002",
  "P2025",
  "P2014",
]);

const NETWORK_CODES = new Set([
  "ECONNREFUSED",
  "ECONNRESET",
  "ETIMEDOUT",
  "ENOTFOUND",
  "ENETUNREACH",
  "EAI_AGAIN",
  "EPIPE",
  "EHOSTUNREACH",
]);

const PERMISSION_CODES = new Set([
  "EACCES",
  "EPERM",
  "ER_ACCESS_DENIED_ERROR",
  "403",
  "Forbidden",
]);

const VALIDATION_PATTERNS = [
  /validat(e|ion)/i,
  /invalid/i,
  /required/i,
  /must be/i,
  /expected/i,
  /Unexpected token/,
  /JSON/,
  /schema/i,
  /400/,
  "Bad Request",
];

const TIMEOUT_PATTERNS = [
  /timeout/i,
  "ETIMEDOUT",
  "ESOCKETTIMEDOUT",
  "timeout of",
  "504",
  "Gateway Timeout",
];

function matchPatterns(msg: string, patterns: (RegExp | string)[]): boolean {
  for (const p of patterns) {
    if (typeof p === "string" && msg.includes(p)) return true;
    if (p instanceof RegExp && p.test(msg)) return true;
  }
  return false;
}

function getErrorInfo(err: unknown): { name: string; message: string; code?: string } {
  if (err instanceof Error) {
    const code = (err as { code?: string }).code;
    return { name: err.name, message: err.message, code };
  }
  const s = String(err);
  return { name: "Error", message: s };
}

export function diagnose(err: unknown): DiagnosisResult {
  const { name, message, code } = getErrorInfo(err);
  const codeUpper = code?.toUpperCase();
  const msg = `${name} ${message}`;

  if (codeUpper && DB_CODES.has(codeUpper)) {
    return {
      category: "database",
      code: code ?? undefined,
      hint: "Falha em operação de banco de dados.",
      suggestedAction: "Verificar conectividade, credenciais e estado do banco.",
    };
  }

  if (codeUpper && NETWORK_CODES.has(codeUpper)) {
    return {
      category: "network",
      code: code ?? undefined,
      hint: "Falha de rede ou serviço indisponível.",
      suggestedAction: "Verificar conectividade, DNS e se o serviço está no ar.",
    };
  }

  if (codeUpper && PERMISSION_CODES.has(codeUpper) || message.includes("403") || message.includes("Forbidden")) {
    return {
      category: "permission",
      code: code ?? undefined,
      hint: "Acesso negado ou permissão insuficiente.",
      suggestedAction: "Revisar permissões e políticas de acesso.",
    };
  }

  if (matchPatterns(msg, VALIDATION_PATTERNS)) {
    return {
      category: "validation",
      hint: "Dados inválidos ou fora do formato esperado.",
      suggestedAction: "Validar payload e regras de negócio.",
    };
  }

  if (codeUpper && TIMEOUT_PATTERNS.some((p) => typeof p === "string" && p === codeUpper) || matchPatterns(msg, TIMEOUT_PATTERNS)) {
    return {
      category: "timeout",
      code: code ?? undefined,
      hint: "Operação excedeu o tempo limite.",
      suggestedAction: "Aumentar timeout ou otimizar a operação.",
    };
  }

  const known = [
    "ECONNREFUSED",
    "ECONNRESET",
    "ETIMEDOUT",
    "ENOENT",
    "EACCES",
    "EPERM",
    "ERR_HTTP_HEADERS_SENT",
  ];
  if (codeUpper && known.includes(codeUpper)) {
    return {
      category: "known",
      code: code ?? undefined,
      hint: "Erro conhecido do ambiente.",
      suggestedAction: "Consultar documentação do código de erro.",
    };
  }

  return {
    category: "unknown",
    code: code ?? undefined,
    hint: "Sem classificação automática.",
    suggestedAction: "Analisar stack trace e contexto da operação.",
  };
}
