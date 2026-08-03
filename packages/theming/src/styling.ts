/**
 * The styling seam — hope-ui's recipe engine and class-merge helpers, all from `tailwind-variants`,
 * which bundles its own `clsx` equivalent (so `clsx` is never a separate dependency) and takes
 * `tailwind-merge` as an optional peer this package supplies.
 *
 * - `tv` — the bound instance every hope-ui recipe is built with, and the single place that decides
 *   how conflicting Tailwind utilities collapse. Its `twMergeConfig` registers hope's semantic color
 *   vocabulary, so `bg-primary`, `bg-primary-soft` and `ring-focus-halo` are all recognized as colors
 *   and resolve against one another predictably.
 * - `cn` — concatenate *with* conflict resolution, for the rare merge outside a recipe. A consumer's
 *   `class` does not go through here: it goes through the recipe's own slot function
 *   (`recipe(v).root({ class })`), which already applies the config below.
 * - `cx` — concatenate *without* conflict resolution.
 */
import { createTV } from "tailwind-variants";
import { SEMANTIC_COLOR_TOKENS } from "./semantic-tokens";

export { cn, cx } from "tailwind-variants";

export const tv = createTV({
  twMerge: true,
  twMergeConfig: {
    extend: {
      theme: {
        // tailwind-merge's default `color` scale matches anything, so `bg-primary` and `bg-danger`
        // already collapse into one group without this. Listing the real token names buys two things:
        // a typo'd fill is no longer silently accepted as "a color", and the merge keeps working if
        // tailwind-merge ever tightens that match-anything default.
        color: [...SEMANTIC_COLOR_TOKENS],
      },
    },
  },
});
