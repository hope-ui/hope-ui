import { createViteConfig } from "../../vite.config.base";

// One entry (and one subpath export) per top-level `src/` folder — no deeper. The public API is
// the component families (`dialog`) and standalone components (`modal-backdrop`); the building
// blocks are the non-`createX` helpers behind `@hope-ui/primitives/utils` and the `createX`
// behavior primitives behind `@hope-ui/primitives/internal`, each a single barrel. Subfolders
// carry no barrel. Each entry builds to `dist/<name>/index.js` (+ matching `.d.ts`). Keep this in
// lockstep with `package.json#exports`.
export default createViteConfig(import.meta.dirname, {
  entries: {
    dialog: "src/dialog/index.ts",
    "modal-backdrop": "src/modal-backdrop/index.ts",
    internal: "src/internal/index.ts",
    utils: "src/utils/index.ts",
  },
});
