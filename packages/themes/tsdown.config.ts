import { createTsdownConfig } from "../../tsdown.config.base.ts";

// The theme's CSS ships as source (the `./hope` subpath is a `.css` file), but the runtime recipe
// map is a JS build: the `hope/recipes` entry in `package.json`'s `hope.entries` builds to
// `dist/hope/recipes/index.jsx` (+ `.d.ts`). `@hope-ui/theming` stays external (see
// `tsdown.config.base.ts`), so the recipe map resolves `tv`/`slotRecipe` from the consumer's copy.
export default createTsdownConfig(import.meta.dirname);
