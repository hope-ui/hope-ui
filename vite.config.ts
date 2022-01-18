import path from "path";
import copy from "rollup-plugin-copy";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import solidPlugin from "vite-plugin-solid";

import pkg from "./package.json";

export default defineConfig({
  plugins: [
    solidPlugin(),
    dts({
      tsConfigFilePath: "tsconfig.build.json",
      insertTypesEntry: true,
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      formats: ["es", "cjs"],
      fileName: format => (format === "es" ? "index.mjs" : "index.cjs"),
    },
    rollupOptions: {
      plugins: [
        copy({
          targets: [{ src: "src/styles", dest: "dist" }],
          hook: "writeBundle",
        }),
      ],
      external: [
        ...Object.keys(pkg.dependencies),
        ...Object.keys(pkg.peerDependencies),
        "solid-js/web",
        "solid-js/store",
      ],
    },
  },
});
