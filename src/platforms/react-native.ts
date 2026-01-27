/**
 * Logmind – React Native
 * initLogger com platform: "react-native" e device automático.
 * Captura erros globais e falhas de API quando integrado.
 */
/// <reference lib="dom" />

import { initLogger, logmind, getLogger } from "../logger.js";
import { withContext, withContextAsync } from "../context.js";
import type { InitOptions, DeviceInfo } from "../types.js";

export interface ReactNativeInitOptions extends Omit<InitOptions, "platform" | "device"> {
  app: string;
  version: string;
  device?: DeviceInfo | (() => DeviceInfo);
}

function defaultDevice(): DeviceInfo {
  if (typeof navigator === "undefined") {
    return { platform: "react-native" };
  }
  const n = navigator as {
    userAgent?: string;
    platform?: string;
    product?: string;
  };
  return {
    platform: "react-native",
    userAgent: n.userAgent,
    os: n.platform,
  };
}

/**
 * Inicializa o Logmind para React Native.
 * Define platform e device automaticamente.
 */
export function initReactNative(opts: ReactNativeInitOptions): void {
  initLogger({
    ...opts,
    platform: "react-native",
    device: opts.device ?? defaultDevice,
  });
}

export const log = logmind;
export { withContext, withContextAsync, getLogger };
