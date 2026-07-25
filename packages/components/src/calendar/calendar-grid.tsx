import { createCalendarGrid } from "@hope-ui/primitives/calendar";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { For, merge, omit, Show } from "solid-js";
import { CalendarCell } from "./calendar-cell";
import { useCalendarContext } from "./calendar-context";

export interface CalendarGridProps extends JSX.HTMLAttributes<HTMLTableElement> {
  /**
   * Renders as a different element/component while keeping Grid's computed props (`role="grid"`, the
   * `aria-labelledby` to the heading, the roving `tabindex` and the whole keymap). The children stay
   * `<thead>`/`<tbody>`/`<tr>`, so a target that isn't table-shaped produces invalid HTML — that is
   * the consumer's call to make, as it is in Base UI.
   */
  render?: RenderProp<JSX.HTMLAttributes<HTMLTableElement>>;
  /** Merged over the recipe's `grid` slot (applied last), so the consumer's utilities win. */
  class?: string;
}

/**
 * The `<table role="grid">`. Assembles `createCalendarGrid` (roving arrow/Home/End/Page navigation +
 * `aria-labelledby`/`data-view`) and renders the weekday head (month view) + the day rows/cells
 * internally — a consumer can't hand-author 42 reactive cells. The weekday `<th>` carries the `weekday`
 * slot; each `<td>`/`<button>` carries `cell`/`cellTrigger` (via `CalendarCell`). Pure assembly + theme.
 *
 * The `<table>` and the `<thead>` go through `renderElement`; the remaining `<tr>`/`<th>`/`<tbody>` are
 * plain literals. The distinction is hydration-key stability: an element that **spreads a props object
 * from the primitive hook** allocates `_hk` differently for its subtree under the server (`ssr`) vs the
 * client (`dom`) Solid compile — measured, not assumed: spreading `headerProps` onto a literal `<thead>`
 * left all seven `<th>` unclaimed on hydrate. `renderElement` → `<Dynamic>` (a component call)
 * allocates identically on both. The remaining tags spread nothing, so a literal is correct — and
 * clearer — there.
 */
export function Grid(props: CalendarGridProps): JSX.Element {
  const ctx = useCalendarContext();
  const grid = createCalendarGrid(ctx.state, omit(props, "render"));

  /** The weekday `<thead>`. Its own component so `grid.headerProps` reaches it through
   * `renderElement`: a spread on a *literal* `<thead>` makes the client compile allocate its subtree's
   * `_hk` differently from the server's, and the seven `<th>` come back unclaimed on hydrate. */
  function WeekdayHead(): JSX.Element {
    return renderElement<JSX.HTMLAttributes<HTMLTableSectionElement>>({
      as: "thead",
      props: merge(grid.headerProps, {
        get children(): JSX.Element {
          return (
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
          );
        },
      }),
    });
  }

  const children = (
    <>
      <Show when={ctx.state.view() === "month"}>
        <WeekdayHead />
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
      return ctx.slots.grid(props.class);
    },
    children,
  });
  return renderElement<JSX.HTMLAttributes<HTMLTableElement>>({
    as: "table",
    render: props.render,
    props: elementProps,
  });
}
