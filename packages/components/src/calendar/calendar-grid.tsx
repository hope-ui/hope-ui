import { createCalendarGrid } from "@hope-ui/primitives/calendar";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { For, merge, omit, Show } from "solid-js";
import { CalendarCell } from "./calendar-cell";
import { useCalendarContext } from "./calendar-context";

export interface CalendarGridProps extends JSX.HTMLAttributes<HTMLTableElement> {
  /**
   * Renders as a different element/component while keeping Grid's computed props (`role="grid"`, the
   * `aria-labelledby` to the heading, the tab stop and the whole keyboard handling). The children stay
   * `<thead>`/`<tbody>`/`<tr>`, so a target that isn't table-shaped produces invalid HTML — that is
   * the consumer's call to make.
   */
  render?: RenderProp<JSX.HTMLAttributes<HTMLTableElement>>;
  /** Merged over the recipe's `grid` slot (applied last), so the consumer's utilities win. */
  class?: string;
}

/**
 * The `<table role="grid">`. The primitive owns arrow/Home/End/Page navigation and the labelling; the
 * weekday head and the day rows are rendered here because a consumer cannot hand-author 42 reactive
 * cells.
 *
 * The `<table>` and `<thead>` go through `renderElement`, while `<tr>`/`<th>`/`<tbody>` are plain
 * literals. The distinction is hydration-key stability: an element that **spreads a props object from
 * the primitive** makes Solid's server and client compilers allocate its subtree's hydration keys
 * differently. Measured, not assumed — spreading onto a literal `<thead>` left all seven `<th>`
 * unclaimed on hydrate. The remaining tags spread nothing, so a literal is correct and clearer there.
 */
export function Grid(props: CalendarGridProps): JSX.Element {
  const ctx = useCalendarContext();
  const grid = createCalendarGrid(ctx.state, omit(props, "render"));

  /** Its own component only so the header props reach a `<thead>` through `renderElement` rather
   * than being spread onto a literal one — see the hydration-key note above. */
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
