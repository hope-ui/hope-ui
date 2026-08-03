/*
 * @hope-ui/presets/hope — Listbox slot recipe.
 *
 * A *slot recipe*: `tv` (tailwind-variants) maps variant props to one class string per named part
 * ("slot"), and `@hope-ui/components`' Listbox reads it through `useRecipe("listbox")`.
 *
 * Listbox is **standalone-first**: it renders as a plain, in-flow list of options — a settings list, a
 * form control, a picker embedded in a page — so the default carries **no elevated/popup chrome** (no
 * surface background, border, shadow, radius or panel padding). A consumer floating a listbox in a
 * popover, or Select/Combobox wrapping it in a `createFloating` layer, supplies that look itself; it
 * is deliberately not baked into the standalone default. Neutral collection surface, no color axis:
 * the only accents are the transient highlight and the persistent selection, both token-driven.
 *
 * ── Highlight is `data-active:` ONLY — never `hover:` / bare `:focus` ────────────────────────────
 * Keyboard and pointer share one active index in the primitive (`createListFocus`), so exactly one row
 * carries `data-active` at a time. A `hover:` or bare `:focus` background would let the cursor's
 * physical position paint a *second* highlight the moment it lagged that index by a frame. (shadcn
 * uses `focus:bg-accent` / `data-highlighted` for the same reason.)
 *
 * ── Recipe purity ───────────────────────────────────────────────────────────────────────────────
 * Every color is a *finished* `--hope-*` design token (`bg-active`/`text-on-active`, `bg-subtle`,
 * `text-foreground`, `opacity-disabled`…) — never one this recipe computes: no `color-mix`, no alpha
 * modifier (`bg-x/50`), no magic opacity. Derived colors are authored as tokens in the preset's
 * `theme.css` instead. Enforced by `pnpm check:recipe-purity`. Every class is a literal string,
 * because the consumer's Tailwind build only emits utilities it can find by scanning this file
 * (`@source "./recipes"`) — a `bg-${role}` template is invisible to it.
 *
 * ── RTL ─────────────────────────────────────────────────────────────────────────────────────────
 * Every inset is *logical* (`pe-8`, `end-1`, `ps-*`), never the physical twin (`pr-8`, `right-1`,
 * `pl-*`): the indicator gutter is reserved on the side the text *ends*, so it mirrors with the locale
 * instead of stranding the glyph on top of the label under `dir="rtl"`. A physical utility never fails
 * loudly — it mis-paints for every RTL reader with every test still green — so it is caught by
 * `pnpm check:rtl-safety` and, per resolved recipe, `assertLogicalPropertyConformance`.
 *
 * ── Single axis: `size` (density) ───────────────────────────────────────────────────────────────
 * Every density value lives *only* in the `size` variants, each carrying its full self-contained set;
 * the base slots carry none, so a size applies additively and nothing depends on tailwind-merge
 * stripping a competing base class. The one exception is the trailing `pe-8` indicator clearance,
 * size-independent chrome that stays in the base because the gutter is wide enough for the largest
 * glyph at every size — so a row's text never shifts for a reason other than density.
 *
 * The row's *vertical* padding is deliberately constant (`py-1.5`): the text size already drives the
 * row's height, and a second size-varying term made `sm` rows read as cramped next to their `sm`
 * control. These values mirror `select.ts` class for class — same rows, so they must look identical.
 * Select is the visual source of truth; a change here without the matching one there is the bug.
 */

import { tv } from "@hope-ui/theming";

/**
 * hope's Listbox slot recipe — used as-is by the component (`recipe(props).item()`), no adapter.
 * `hopeRecipes` (in `./index`) checks it against the `listbox` contract in `@hope-ui/theming`.
 */
export const listboxRecipe = tv({
  slots: {
    // The `role="listbox"` element and, in virtual mode, the scroll element. NO popup chrome (header
    // note). `overflow-y-auto` is structural — virtual mode depends on it, and it only scrolls once a
    // consumer caps the height. `outline-none` because focus is shown by the active row's highlight
    // (in activedescendant mode the container holds focus), not a ring around the whole list. The
    // `min-w-*` floor is a density value and lives per `size`.
    root: "text-foreground overflow-y-auto outline-none",
    // A `role="option"` row. `relative` anchors the absolute `itemIndicator`, `pe-8` reserves the
    // trailing glyph gutter, and the highlight is `data-active:` ONLY (header note). Text, leading
    // padding, gap, radius and the leading-icon box are density values and live per `size`.
    item: "relative flex cursor-default items-center pe-8 outline-none select-none data-active:bg-active data-active:text-on-active data-disabled:pointer-events-none data-disabled:opacity-disabled",
    // Pinned in the reserved `pe-8` gutter, inheriting the row's color. Its inset and glyph box scale
    // with the row, so both live per `size`.
    itemIndicator: "absolute flex items-center justify-center",
    // No horizontal inset, so grouped rows stay aligned with ungrouped ones.
    group: "not-last:pb-1",
    groupLabel: "px-1.5 py-1 text-xs text-foreground-muted",
    separator: "my-1 h-px bg-subtle pointer-events-none",
  },
  variants: {
    // Each size is self-contained — the base carries no competing density class — so a size applies
    // additively and nothing relies on tailwind-merge resolution. Values mirror `select.ts` exactly
    // (header note).
    size: {
      sm: {
        root: "min-w-32",
        item: "text-xs gap-1 py-1.5 ps-1.5 rounded-sm [&_svg]:size-3.5",
        itemIndicator: "end-1 [&_svg]:size-3.5",
      },
      md: {
        root: "min-w-36",
        item: "text-sm gap-1.5 py-1.5 ps-1.5 rounded-md [&_svg]:size-4",
        itemIndicator: "end-1 [&_svg]:size-4",
      },
      lg: {
        root: "min-w-40",
        item: "text-base gap-2 py-1.5 ps-1.5 rounded-md [&_svg]:size-4.5",
        itemIndicator: "end-1 [&_svg]:size-4.5",
      },
    },
  },
  defaultVariants: {
    size: "md",
  },
});
