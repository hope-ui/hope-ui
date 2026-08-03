import type { CreateCalendarReturn } from "@hope-ui/primitives/calendar";
import { createComponentContext } from "@hope-ui/primitives/internal";
import type { CalendarSlot, SlotClassAccessor } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";

/**
 * The value every Calendar part reads. It *holds* the headless state under `state` rather than
 * extending it, so the styling layer never masquerades as the primitive's return value. All
 * accessibility and behavior live on `state`; this layer contributes only `slots` and the glyphs.
 */
export interface CalendarContextValue {
  /** The `createCalendar` return — the view stack, keyboard cursor, selection, date math, the heading
   * id, and the form accessors. Each part passes this into its own `createCalendarX(state, …)` hook. */
  state: CreateCalendarReturn;
  /** One class function per named slot of the theme's `calendar` recipe, resolved once on `Root`. Each
   * takes the part's own `class` and folds it in last, through tailwind-merge, so a consumer's utility
   * wins over the recipe's. */
  slots: Record<CalendarSlot, SlotClassAccessor>;
  /**
   * The resolved navigation glyphs — instance `prevIcon`/`nextIcon`, else the preset's, else hope's
   * built-in chevrons — resolved once on `Root` because a multi-part component keeps its themeable
   * surface there. `Calendar.PrevButton`/`NextButton` render these when given no `children`.
   *
   * Accessors, so each read builds a **fresh** element: one shared element would be moved between the
   * two buttons rather than appearing in both.
   */
  prevIcon: () => JSX.Element;
  nextIcon: () => JSX.Element;
}

export const [CalendarContext, useCalendarContext] =
  createComponentContext<CalendarContextValue>("Calendar");
