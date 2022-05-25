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
  build: {
    target: "esnext",
    polyfillDynamicImport: false,
  },
});
