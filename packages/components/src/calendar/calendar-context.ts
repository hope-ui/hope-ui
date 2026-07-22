import type { CreateCalendarReturn } from "@hope-ui/primitives/calendar";
import { createComponentContext } from "@hope-ui/primitives/internal";
import type { CalendarSlot } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";

/**
 * The value every Calendar part reads. **Composition, not inheritance**: it *holds* the primitive
 * state as `state` (the view machine / roving cursor / selection / date math + predicates, the shared
 * navigation kernel, the heading id, and the native-form accessors) rather than extending
 * `CreateCalendarReturn`, so the styling layer never masquerades as the primitive return. A part
 * passes `ctx.state` into its `createCalendarX(state, …)` hook and reads recipe classes off
 * `ctx.slots`. All a11y/behavior lives on `ctx.state`; the component layer contributes only `slots`.
 */
export interface CalendarContextValue {
  /** The primitive calendar state — view/cursor/selection/date-math, the shared navigation kernel, the
   * heading id, and the form accessors. Passed straight into each part's `createCalendarX(state, …)`. */
  state: CreateCalendarReturn;
  /** One ready-to-call class fn per Calendar slot, resolved once on `Root` and shared here. */
  slots: Record<CalendarSlot, () => string>;
  /**
   * The resolved default navigation glyphs (instance `prevIcon`/`nextIcon` ?? preset `defaultProps` ??
   * hope's built-in chevrons), resolved once on `Root` (the multi-part component keeps its themeable
   * surface on the root) and flowed here. `Calendar.PrevButton`/`NextButton` render these when given no
   * `children`. Accessors, so each read builds a **fresh** element — never a reused, movable node.
   */
  prevIcon: () => JSX.Element;
  nextIcon: () => JSX.Element;
}

export const [CalendarContext, useCalendarContext] =
  createComponentContext<CalendarContextValue>("Calendar");
