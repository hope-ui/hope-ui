import { createCalendarGrid } from "@hope-ui/primitives/calendar";
import { renderElement } from "@hope-ui/primitives/render";
import { cx } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { For, merge, Show } from "solid-js";
import { CalendarCell } from "./calendar-cell";
import { useCalendarContext } from "./calendar-context";

export interface CalendarGridProps extends JSX.HTMLAttributes<HTMLTableElement> {
  /** Merged over the recipe's `grid` slot (applied last), so the consumer's utilities win. */
  class?: string;
}

/**
 * The `<table role="grid">`. Assembles `createCalendarGrid` (roving arrow/Home/End/Page navigation +
 * `aria-labelledby`/`data-view`) and renders the weekday head (month view) + the day rows/cells
 * internally — a consumer can't hand-author 42 reactive cells. The weekday `<th>` carries the `weekday`
 * slot; each `<td>`/`<button>` carries `cell`/`cellTrigger` (via `CalendarCell`). Pure assembly + theme.
 *
 * The `<table>` goes through `renderElement`, but the structural `<thead>`/`<tr>`/`<th>`/`<tbody>` are
 * plain literals. The distinction is hydration-key stability: the `<table>` spreads the getter-laden
 * `grid.props` and has reactive children, and a getter-spread on a literal host element allocates `_hk`
 * differently under the server (`ssr`) vs client (`dom`) Solid compile — so it must be a `<Dynamic>` (a
 * component call), which allocates identically on both. The structural tags carry no such spread, so a
 * literal is correct — and clearer — there.
 */
export function Grid(props: CalendarGridProps): JSX.Element {
  const ctx = useCalendarContext();
  const grid = createCalendarGrid(ctx.state, props);
  const children = (
    <>
      <Show when={ctx.state.view() === "month"}>
        <thead>
          <tr>
            <For each={ctx.state.weekdays()}>
              {(weekday) => (
                <th
                  scope="col"
                  aria-label={weekday.long}
                  data-slot="calendar-weekday"
                  class={ctx.slots.weekday()}
                >
                  {weekday.short}
                </th>
              )}
            </For>
          </tr>
        </thead>
      </Show>
      <tbody>
        <For each={ctx.state.cells()}>
          {(row) => (
            <tr>
              <For each={row}>{(model) => <CalendarCell model={model} />}</For>
            </tr>
          )}
        </For>
      </tbody>
    </>
  );
  const elementProps = merge(grid.props, {
    "data-slot": "calendar-grid",
    get class(): string {
      return cx(ctx.slots.grid(), props.class) ?? "";
    },
    children,
  });
  return renderElement<JSX.HTMLAttributes<HTMLTableElement>>({ as: "table", props: elementProps });
}
