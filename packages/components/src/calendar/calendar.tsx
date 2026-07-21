import {
  type CalendarCellModel,
  type CreateCalendarOptions,
  type CreateCalendarReturn,
  createCalendar,
  createCalendarCell,
  createCalendarGrid,
  createCalendarHeading,
  createCalendarNext,
  createCalendarPrev,
} from "@hope-ui/primitives/calendar";
import { createComponentContext } from "@hope-ui/primitives/internal";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import { Dynamic, type JSX } from "@solidjs/web";
import { type Component, For, merge, omit, Show } from "solid-js";

// Calendar is a thin JSX layer over the `createCalendar` hook family (`@hope-ui/primitives/calendar`).
// `Root` calls `createCalendar` once for the shared state (view machine / cursor / selection / date
// math) and puts it on context; the chrome parts (`PrevButton`/`Heading`/`NextButton`) read it, and
// `Grid` renders the `<table role="grid">` + its rows/cells internally (a consumer can't hand-author
// 42 dynamic cells). See `calendar.md`.
//
// Every host element goes through `renderElement`/`Dynamic`, never a literal `<div>`/`<td>`: the repo's
// SSR test project compiles JSX for the DOM and runs it against `@solidjs/web`'s *server* build, where
// a hoisted `_$template()` (what a literal element compiles to) throws at import. `Dynamic` is a
// component call, so it carries no template. (The published library ships JSX-preserved source and the
// consumer compiles per environment, where literals are fine — this is purely a test-harness constraint,
// the same one `dialog`/`box` follow.)
const [CalendarContext, useCalendarContext] =
  createComponentContext<CreateCalendarReturn>("Calendar");

// ---------- Root ----------

export interface CalendarRootProps extends CreateCalendarOptions {
  /** Extra class on the `role="group"` container. */
  class?: string;
  children?: JSX.Element;
}

export const Root: Component<CalendarRootProps> = (props) => {
  const calendar = createCalendar(props);
  const groupProps = {
    role: "group" as const,
    get "aria-label"() {
      return calendar.groupLabel();
    },
    get "data-disabled"() {
      return calendar.disabled() ? "" : undefined;
    },
    get "data-readonly"() {
      return calendar.readOnly() ? "" : undefined;
    },
    get class() {
      return props.class;
    },
    get children() {
      return props.children;
    },
  };
  return (
    <CalendarContext value={calendar}>
      {renderElement({ as: "div", props: groupProps })}
    </CalendarContext>
  );
};

// ---------- Header ----------

export type CalendarHeaderProps = JSX.HTMLAttributes<HTMLDivElement>;

/** A structural layout row for the chrome (prev / heading / next). Purely presentational. */
export const Header: Component<CalendarHeaderProps> = (props) => {
  return renderElement<CalendarHeaderProps>({ as: "div", props });
};

// ---------- PrevButton ----------

export interface CalendarPrevButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  render?: RenderProp<JSX.ButtonHTMLAttributes<HTMLButtonElement>>;
}

export const PrevButton: Component<CalendarPrevButtonProps> = (props) => {
  const state = useCalendarContext();
  const prev = createCalendarPrev(state, omit(props, "render"));
  return renderElement<JSX.ButtonHTMLAttributes<HTMLButtonElement>>({
    as: "button",
    render: props.render,
    props: prev.props,
  });
};

// ---------- NextButton ----------

export interface CalendarNextButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  render?: RenderProp<JSX.ButtonHTMLAttributes<HTMLButtonElement>>;
}

export const NextButton: Component<CalendarNextButtonProps> = (props) => {
  const state = useCalendarContext();
  const next = createCalendarNext(state, omit(props, "render"));
  return renderElement<JSX.ButtonHTMLAttributes<HTMLButtonElement>>({
    as: "button",
    render: props.render,
    props: next.props,
  });
};

// ---------- Heading ----------

export interface CalendarHeadingProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  render?: RenderProp<JSX.ButtonHTMLAttributes<HTMLButtonElement>>;
}

export const Heading: Component<CalendarHeadingProps> = (props) => {
  const state = useCalendarContext();
  const heading = createCalendarHeading(state, omit(props, "render"));
  return renderElement<JSX.ButtonHTMLAttributes<HTMLButtonElement>>({
    as: "button",
    render: props.render,
    // Default the label to the current period; a consumer child overrides it.
    props: merge(heading.props, {
      get children() {
        return props.children ?? state.headingLabel();
      },
    }),
  });
};

// ---------- Grid ----------

export type CalendarGridProps = JSX.HTMLAttributes<HTMLTableElement>;

/** The `<table role="grid">`. Renders the weekday head (month view) + rows/cells internally. */
export const Grid: Component<CalendarGridProps> = (props) => {
  const state = useCalendarContext();
  const grid = createCalendarGrid(state, props);
  const children = (
    <>
      <Show when={state.view() === "month"}>
        <Dynamic component="thead">
          <Dynamic component="tr">
            <For each={state.weekdays()}>
              {(weekday) => (
                <Dynamic component="th" scope="col" aria-label={weekday.long}>
                  {weekday.short}
                </Dynamic>
              )}
            </For>
          </Dynamic>
        </Dynamic>
      </Show>
      <Dynamic component="tbody">
        <For each={state.cells()}>
          {(row) => (
            <Dynamic component="tr">
              <For each={row}>{(model) => <CalendarCellView model={model} />}</For>
            </Dynamic>
          )}
        </For>
      </Dynamic>
    </>
  );
  return renderElement<JSX.HTMLAttributes<HTMLTableElement>>({
    as: "table",
    props: merge(grid.props, { children }),
  });
};

/** One rendered cell — a `<td role="gridcell">` wrapping the roving `<button>`. Internal to `Grid`. */
function CalendarCellView(props: { model: CalendarCellModel }): JSX.Element {
  const state = useCalendarContext();
  const cell = createCalendarCell(state, {
    date: () => props.model.date,
    label: () => props.model.label,
    isOutside: () => props.model.isOutside,
  });
  const trigger = renderElement<JSX.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>({
    as: "button",
    props: merge(cell.triggerProps, {
      get children() {
        return props.model.label;
      },
    }),
    ref: cell.setTriggerRef,
  });
  return renderElement<JSX.HTMLAttributes<HTMLTableCellElement>>({
    as: "td",
    props: merge(cell.props, { children: trigger }),
  });
}

export const Calendar = { Root, Header, PrevButton, NextButton, Heading, Grid };
