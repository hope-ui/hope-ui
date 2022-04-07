import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import prismjs from "vite-plugin-prismjs";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
  plugins: [
    solidPlugin(),
    prismjs({
      languages: ["bash", "js", "tsx", "html", "css"],
      plugins: ["copy-to-clipboard", "line-highlight"],
      css: false,
    }),
  ],
  resolve: {
    alias: {
      "@/": fileURLToPath(new URL("./src/", import.meta.url)),
      "@hope-ui/solid": fileURLToPath(new URL("../../packages/solid/src", import.meta.url)),
    },
  },
  build: {
    target: "esnext",
    polyfillDynamicImport: false,
  },
});
