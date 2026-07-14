/**
 * The styling seam — hope-ui's recipe engine and class-merge helpers, all sourced from
 * **`tailwind-variants`** (it ships its own `clsx`-equivalent; `tailwind-merge` is its optional peer,
 * which `@hope-ui/theming` provides as a dependency — so `clsx` is never a separate dependency).
 *
 * - `tv` — a `createTV`-bound instance, the single source of truth for how hope-ui recipes merge
 *   conflicting Tailwind utilities. The shared `twMergeConfig` that registers hope's semantic color
 *   groups (so `bg-primary` and `bg-danger` are known to conflict) is added here alongside the first
 *   slot recipe, where such merges are actually exercised and testable; until then the default merge
 *   is already correct for every standard utility the codebase uses.
 * - `cn` — concatenate + tailwind-merge conflict resolution, for the rare non-recipe merge. The
 *   common consumer-`class` override is merged *through* a recipe's slot function
 *   (`recipe(v).root({ class })`), not through `cn`.
 * - `cx` — concatenate WITHOUT conflict resolution (clsx-style).
 */
import { createTV } from "tailwind-variants";

export { cn, cx } from "tailwind-variants";

export const tv = createTV({ twMerge: true });
