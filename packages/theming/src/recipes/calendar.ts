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
 * The curated Calendar props a preset may default app-wide via `ComponentOverride.defaultProps`.
 * Calendar carries no non-variant chrome content, so this is exactly the recipe variants — a strict
 * superset of {@link CalendarRecipeVariants} by construction (`extends`), so it registers in
 * `ThemeablePropsRegistry` and `ThemeablePropsOf<"calendar">` widens nothing away.
 */
export interface CalendarThemeableProps extends CalendarRecipeVariants {}

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
