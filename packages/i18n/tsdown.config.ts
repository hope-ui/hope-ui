import { createTsdownConfig } from "../../tsdown.config.base.ts";

// Single root entry (`@hope-ui/i18n`) — one cohesive locale/direction/messages module, not a bag
// of subpaths — listed in `package.json`'s `hope.entries`. Ships JSX-preserved source only; see
// `tsdown.config.base.ts` and `__internal__/plan.md`.
export default createTsdownConfig(import.meta.dirname);
