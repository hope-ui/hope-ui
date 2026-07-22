/**
 * The **Calendar** recipe contract — its variant vocabulary, slots, and the resulting `CalendarRecipe`
 * type.
 *
 * Owned by `@hope-ui/theming` (the look-&-feel authority), not the component or a preset: the
 * `@hope-ui/components` `Calendar` consumes it via `useRecipe("calendar")`, and each preset
 * (`@hope-ui/presets/*`) implements a `tailwind-variants` recipe against it. One file per component
 * keeps the registry (`../recipe-registry`) a flat list of named recipe types with no shape logic of
 * its own.
 *
 * Calendar is a **neutral date surface** — a `role="group"` wrapping a navigation header over a
 * `role="grid"` of day cells — so like Dialog/Listbox it carries **no** color axis. The only accents
 * are the selection (painted with the `primary` / `on-primary` tokens, the way shadcn/Nova selects a
 * day) and the range band + tentative hover band (the `selected` / `on-selected` tokens), neither of
 * which is a variant. Its single axis is `size` — the density scale (the day-cell box, its text, and
 * the navigation buttons) a consumer sets once on `Calendar.Root`, the same way `button`/`badge`/
 * `listbox` scale sizes.
 *
 * The day-cell state (today / outside-month / selected / range endpoints + middle / tentative
 * highlight / disabled) is styled by the preset's **registered `data-*` custom variants** — the
 * canonical `data-today`/`data-outside-month`/`data-range-*`/`data-highlighted`/`data-selected`/
 * `data-disabled` hooks `createCalendarCell` emits — never a `hover:` / bare `:focus` background, so
 * pointer and keyboard share one visual state. Every color is a finished `--hope-*` token (recipe
 * purity). See `theming.md`.
 */
import type { JSX } from "@solidjs/web";
import type { SlotRecipeFn } from "../slot-recipe";

/**
 * The density scale. `sm`/`md`/`lg` scale the day-cell box (≈32 / 36 / 40px), its text, and the
 * navigation buttons; `md` is the default and matches the recipe's base metrics.
 */
export type CalendarSize = "sm" | "md" | "lg";

/** The Calendar recipe's variant props — also the density axis a preset may default app-wide. */
export interface CalendarRecipeVariants {
  /** Day-cell + navigation density scale. Default `md`. */
  size?: CalendarSize;
}

/**
 * The curated Calendar props a preset may default app-wide via `ComponentOverride.defaultProps`: the
 * recipe variants **plus** the two navigation glyphs. A strict superset of {@link CalendarRecipeVariants}
 * by construction (`extends`), so it registers in `ThemeablePropsRegistry` and
 * `ThemeablePropsOf<"calendar">` widens the variants-only surface without dropping anything.
 *
 * Each glyph is a **factory** (`() => JSX.Element`), never a bare `JSX.Element`: a preset value is one
 * object shared by every instance, and a Solid `JSX.Element` is an already-built node that would
 * *move* if reused, so a factory (called per instance) is what lets a preset swap the app-wide nav
 * icons without two calendars fighting over one node. Mirrors CloseButton's `icon`. Calendar is a
 * multi-part component, so its themeable surface stays on the **root** (no per-part themeable props):
 * `Calendar.Root` resolves these through `runIfFunction` and flows them to the `PrevButton` /
 * `NextButton` parts via context, where they are the default child. The **per-instance** override is
 * that part's own `children`.
 */
export interface CalendarThemeableProps extends CalendarRecipeVariants {
  /** App-wide default previous-period glyph, as a factory. Falls back to hope's built-in chevron. */
  prevIcon?: () => JSX.Element;
  /** App-wide default next-period glyph, as a factory. Falls back to hope's built-in chevron. */
  nextIcon?: () => JSX.Element;
}

/**
 * The Calendar recipe's slots. `root` is the `role="group"` container; `header` the navigation row;
 * `heading` the center caption `<button>`; `prevButton`/`nextButton` the navigation `<button>`s;
 * `grid` the `<table role="grid">`; `weekday` a `<th scope="col">` in the weekday head; `cell` a
 * `<td role="gridcell">`; `cellTrigger` the roving day `<button>` inside each cell (where all the
 * `data-*` day state is painted).
 */
export type CalendarSlot =
  | "root"
  | "header"
  | "heading"
  | "prevButton"
  | "nextButton"
  | "grid"
  | "weekday"
  | "cell"
  | "cellTrigger";

/** The Calendar recipe: variant props → one class function per slot. The registry entry for `calendar`. */
export type CalendarRecipe = SlotRecipeFn<CalendarRecipeVariants, CalendarSlot>;
