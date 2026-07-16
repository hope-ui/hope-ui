/**
 * The styling seam — hope-ui's recipe engine and class-merge helpers, all sourced from
 * **`tailwind-variants`** (it ships its own `clsx`-equivalent; `tailwind-merge` is its optional peer,
 * which `@hope-ui/theming` provides as a dependency — so `clsx` is never a separate dependency).
 *
 * - `tv` — a `createTV`-bound instance, the single source of truth for how hope-ui recipes merge
 *   conflicting Tailwind utilities. It carries the shared `twMergeConfig` that registers hope's
 *   semantic color vocabulary (so `bg-primary`, `bg-primary-soft`, `border-primary-line`, and
 *   `ring-focus-halo` are all known colors that resolve deterministically against one another).
 * - `cn` — concatenate + tailwind-merge conflict resolution, for the rare non-recipe merge. A
 *   component merges a consumer `class` through the recipe's own slot function
 *   (`recipe(v).root({ class })`), which already uses the `tv` config below — not through `cn`.
 * - `cx` — concatenate WITHOUT conflict resolution (clsx-style).
 */
import { createTV } from "tailwind-variants";
import { SEMANTIC_COLOR_TOKENS } from "../semantic-tokens/semantic-tokens";

export { cn, cx } from "tailwind-variants";

export const tv = createTV({
  twMerge: true,
  twMergeConfig: {
    extend: {
      theme: {
        // Register hope's semantic color vocabulary as a first-class tailwind-merge `color` scale.
        // tailwind-merge's default `color` scale is the permissive `isAny`, so `bg-primary` and
        // `bg-danger` already collapse to one `bg-color` group — but listing the real token names
        // makes the merge deterministic for the hope palette (a typo'd fill isn't silently accepted
        // as "a color") and survives a future tailwind-merge that tightens `isAny` away. Every
        // semantic token is a color value, so the whole vocabulary registers: fills + their
        // interaction ladders (`primary`, `primary-soft`, `primary-hovered`, `primary-pressed`,
        // `primary-line`, …), role content + on-colors (`primary-emphasis`, `on-primary`,
        // `on-inverse`), the `foreground*`/`surface*` ramps, neutral borders (`subtle`/`strong`),
        // collection states (`active`/`selected`), and the systemic `focus`/`focus-halo`/`scrim`.
        color: [...SEMANTIC_COLOR_TOKENS],
      },
    },
  },
});
