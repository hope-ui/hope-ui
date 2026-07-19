import { createTsdownConfig } from "../../tsdown.config.base.ts";

// Entries (one subpath export per component) live in `package.json`'s `hope.entries`.
// Ships JSX-preserved source only — see `tsdown.config.base.ts` and `__internal__/plan.md`.
export default createTsdownConfig(import.meta.dirname);
