import { type CalendarCellModel, createCalendarCell } from "@hope-ui/primitives/calendar";
import { renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { merge } from "solid-js";
import { useCalendarContext } from "./calendar-context";

/**
 * One rendered day cell — a `<td role="gridcell">` wrapping the roving day `<button>`. Internal to
 * `Calendar.Grid` (a consumer can't hand-author 42 reactive cells), so it isn't part of the `Calendar`
 * namespace. Assembles `createCalendarCell`: `cell.props` (the ARIA grid-cell semantics) go on the
 * `<td>`, and `cell.triggerProps` (interaction + every `data-*` day-state paint hook) go on the
 * `<button>`, where the recipe's `cellTrigger` slot reads them. Pure assembly + theme.
 *
 * The `<td>`/`<button>` are rendered through `renderElement` (not literal tags) for **hydration-key
 * stability**: each spreads a getter-laden props object from the primitive hook, and a getter-spread on
 * a literal host element allocates `_hk` differently under the server (`ssr`) vs client (`dom`) Solid
 * compile, shifting every following key and breaking the round-trip. `renderElement` → `<Dynamic>` (a
 * component call) allocates identically on both — the same reason `Listbox` routes its item element
 * through it. `renderElement` also merges the trigger ref. Static structural tags (`thead`/`tr`/`th`/
 * `tbody`, the group/header `div`) carry no such spread, so `Calendar.Grid` writes those as literals.
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
      get class(): string {
        return ctx.slots.cell();
      },
      children: trigger,
    }),
  });
}
