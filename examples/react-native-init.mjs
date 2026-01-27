/**
 * Exemplo: React Native – initReactNative.
 * Coloque no entry (ex: App.js) antes do resto da app.
 */

import { initReactNative, log } from "../dist/platforms/react-native.js";

initReactNative({
  app: "meu-app",
  version: "1.0.0",
  transport: "json",
});

// Uso em componente:
// withContext({ userId: "123", screen: "Home" }, () => {
//   log.info("Tela Home montada");
// });
log.info("App iniciado");
