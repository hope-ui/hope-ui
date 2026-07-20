import { createTsdownConfig } from "../../tsdown.config.base.ts";

// One entry (and one subpath export) per top-level `src/` folder — `dialog`, `modal-backdrop`,
// `internal`, `utils` — listed in `package.json`'s `hope.entries`. Ships JSX-preserved source
// only — see `tsdown.config.base.ts` and `__internal__/plan.md`.
export default createTsdownConfig(import.meta.dirname);
