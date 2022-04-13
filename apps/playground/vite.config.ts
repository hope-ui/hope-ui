import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
  plugins: [solidPlugin()],
  resolve: {
    alias: {
      "@/": fileURLToPath(new URL("./src/", import.meta.url)),
      "@hope-ui/solid": fileURLToPath(new URL("../../packages/solid/src/index.ts", import.meta.url)),
    },
  },
  build: {
    target: "esnext",
    polyfillDynamicImport: false,
  },
});
