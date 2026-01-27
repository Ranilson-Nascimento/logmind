import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "platforms/react-native": "src/platforms/react-native.ts",
    "platforms/browser": "src/platforms/browser.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  target: "node16",
  outDir: "dist",
  esbuildOptions(options) {
    options.mainFields = ["module", "main"];
  },
});
