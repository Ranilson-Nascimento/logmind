/**
 * Logmind – Browser
 * initLogger com platform: "browser", detecção de erros globais e falhas de API.
 */
/// <reference lib="dom" />

import { initLogger, log } from "../index.js";
import type { InitOptions, DeviceInfo } from "../types.js";

export interface BrowserInitOptions extends Omit<InitOptions, "platform" | "device"> {
  app?: string;
  version?: string;
  device?: DeviceInfo | (() => DeviceInfo);
  /** Capturar erros globais (window.onerror, unhandledrejection). */
  captureGlobalErrors?: boolean;
}

function defaultDevice(): DeviceInfo {
  if (typeof navigator === "undefined") return { platform: "browser" };
  const n = navigator as { userAgent?: string; platform?: string };
  return {
    platform: "browser",
    userAgent: n.userAgent,
    os: n.platform,
  };
}

/**
 * Inicializa o Logmind para browser.
 * Opcionalmente registra handlers para erros não tratados.
 */
export function initBrowser(opts: BrowserInitOptions = {}): void {
  initLogger({
    ...opts,
    platform: "browser",
    device: opts.device ?? defaultDevice,
  });

  if (opts.captureGlobalErrors !== false && typeof window !== "undefined") {
    window.addEventListener("error", (e: ErrorEvent) => {
      log.error(e.message, e.error ?? e, { filename: e.filename, lineno: e.lineno });
    });
    window.addEventListener("unhandledrejection", (e: PromiseRejectionEvent) => {
      log.error("Unhandled rejection", e.reason, {});
    });
  }
}

export { log, withContext, withContextAsync, getLogger } from "../index.js";
