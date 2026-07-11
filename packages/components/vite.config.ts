import { createViteConfig } from "../../vite.config.base";

export default createViteConfig(import.meta.dirname, {
  entries: {
    box: "src/box/index.ts",
    button: "src/button/index.ts",
    dialog: "src/dialog/index.ts",
  },
});
