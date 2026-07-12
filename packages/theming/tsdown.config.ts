import { createTsdownConfig } from "../../tsdown.config.base.ts";

// Entries (root `.` + the `conformance` subpath) live in `package.json`'s `hope.entries`.
// Ships JSX-preserved source only — see `tsdown.config.base.ts` and `docs/plan.md`.
export default createTsdownConfig(import.meta.dirname);
