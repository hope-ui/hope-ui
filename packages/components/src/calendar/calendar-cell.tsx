import { type CalendarCellModel, createCalendarCell } from "@hope-ui/primitives/calendar";
import { renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { merge } from "solid-js";
import { useCalendarContext } from "./calendar-context";

/**
 * One rendered day cell — a `<td role="gridcell">` wrapping the day `<button>`. Internal to
 * `Calendar.Grid`, since a consumer cannot hand-author 42 reactive cells, so it is not part of the
 * public `Calendar` namespace. The ARIA grid-cell semantics go on the `<td>`; the interaction and
 * every `data-*` day-state paint hook go on the `<button>`, where the recipe reads them.
 *
 * Both go through `renderElement` rather than literal tags, for **hydration-key stability**: each
 * spreads a getter-backed props object from the primitive, and such a spread on a *literal* host
 * element makes Solid's server and client compilers allocate hydration keys differently, shifting
 * every following key and breaking the round-trip. Routing through a component call allocates them
 * identically on both sides. The purely structural tags in `Calendar.Grid` spread nothing, so they
 * stay literals.
 */
export function CalendarCell(props: { model: CalendarCellModel }): JSX.Element {
  const ctx = useCalendarContext();
  const cell = createCalendarCell(ctx.state, {
    date: () => props.model.date,
    label: () => props.model.label,
    isOutside: () => props.model.isOutside,
  });
  const trigger = renderElement<JSX.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>({
    as: "button",
    props: merge(cell.triggerProps, {
      "data-slot": "calendar-cell-trigger",
      // class-forwarding-ok: not a public part — every cell is built from a model, so there is no
      // consumer `class` to fold in. Style it through `slotClasses.cellTrigger` instead.
      get class(): string {
        return ctx.slots.cellTrigger();
      },
      get children(): JSX.Element {
        return props.model.label;
      },
    }),
    ref: cell.setTriggerRef,
  });
  return renderElement<JSX.HTMLAttributes<HTMLTableCellElement>>({
    as: "td",
    props: merge(cell.props, {
      "data-slot": "calendar-cell",
      // class-forwarding-ok: same as the trigger above — internal, model-driven, no consumer props.
      get class(): string {
        return ctx.slots.cell();
      },
      children: trigger,
    }),
  });
}
