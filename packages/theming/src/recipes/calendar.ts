/**
 * The **Calendar** recipe contract — its variant vocabulary, slots, and the resulting `CalendarRecipe`
 * type.
 *
 * A *slot recipe* maps variant props to one class string per named part ("slot"). This file owns only
 * that shape: `@hope-ui/components`' Calendar consumes it via `useRecipe("calendar")` and each preset
 * implements a `tailwind-variants` recipe against it, so neither layer knows the other.
 *
 * Calendar is a **neutral date surface**, so like Dialog and Listbox it carries **no** color axis. The
 * only accents are the selection (`primary`/`on-primary` tokens) and the range band
 * (`selected`/`on-selected`), neither of which is a variant. Its single axis is `size` — the density
 * scale a consumer sets once on `Calendar.Root`.
 *
 * Day-cell state (today / outside-month / selected / band endpoints / disabled) is styled by the
 * preset's registered `data-*` variants, keyed off the attributes `createCalendarCell` emits, never a
 * `hover:` or bare `:focus` background — so pointer and keyboard share one visual state. Range mode
 * paints a single band (tentative while anchored, committed when idle), which is why there is one
 * selection vocabulary rather than a separate tentative-highlight set. Every color is a *finished*
 * `--hope-*` design token, never one the recipe computes ("recipe purity" — see `theming.md`).
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
 * recipe variants **plus** the two navigation glyphs.
 *
 * Each glyph is a **factory** (`() => JSX.Element`), never a bare `JSX.Element`: a preset value is one
 * object shared by every instance, and a Solid `JSX.Element` is an already-built DOM node that would
 * *move* if reused, so calling a factory per instance is what keeps two calendars from fighting over
 * one node. Calendar is a multi-part component, so its themeable surface stays on the **root**:
 * `Calendar.Root` resolves these through `runIfFunction` and flows them to the `PrevButton`/
 * `NextButton` parts via context, where they are the default child. The per-instance override is that
 * part's own `children`.
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
