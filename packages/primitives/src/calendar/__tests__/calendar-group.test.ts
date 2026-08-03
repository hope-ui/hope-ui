import { CalendarDate } from "@internationalized/date";
import type { JSX } from "@solidjs/web";
import { createRoot, flush } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { createCalendarGroup } from "../calendar-group";
import {
  type CreateCalendarOptions,
  type CreateCalendarReturn,
  createCalendar,
} from "../calendar-root";

// This file never hands over the container ref, so the outside-pointer effect stays dormant and the
// hook never reaches for `window` — which is what lets it run in the DOM-less `unit` project at all.
// Only the props surface and the guards that fire *before* any DOM read are reachable here. Which of
// the three `commitBehavior` outcomes runs, and when, is decided against real focus in
// `calendar-group.browser.test.tsx`.
function setup(
  options: CreateCalendarOptions = {},
  props: JSX.HTMLAttributes<HTMLElement> = {},
): {
  api: CreateCalendarReturn;
  props: JSX.HTMLAttributes<HTMLElement>;
  dispose: () => void;
} {
  let api!: CreateCalendarReturn;
  let groupProps!: JSX.HTMLAttributes<HTMLElement>;
  let dispose!: () => void;
  createRoot((d) => {
    dispose = d;
    api = createCalendar({
      selectionMode: "range",
      defaultFocusedValue: new CalendarDate(2026, 1, 15),
      ...options,
    });
    groupProps = createCalendarGroup(api, props).props;
  });
  return { api, props: groupProps, dispose };
}

/** Read one returned attribute. `JSX.HTMLAttributes` declares no `data-*` index signature, so the
 *  state hooks are only reachable by casting the props object back to a plain record. */
const attribute = (props: JSX.HTMLAttributes<HTMLElement>, name: string): unknown =>
  (props as Record<string, unknown>)[name];

/** A `focusout` reduced to what the handler reads before it defers: the element it fired on. */
function focusOut(props: JSX.HTMLAttributes<HTMLElement>, currentTarget: unknown): void {
  const handler = props.onFocusOut as (event: FocusEvent) => void;
  flush(() => handler({ defaultPrevented: false, currentTarget } as unknown as FocusEvent));
}

describe("createCalendarGroup — container props", () => {
  it("gives the container its group role, accessible name and state hooks", () => {
    const { props, dispose } = setup();
    expect(props.role).toBe("group");
    expect(props["aria-label"]).toBe("Calendar");
    expect(attribute(props, "data-disabled")).toBeUndefined();
    expect(attribute(props, "data-readonly")).toBeUndefined();
    expect(attribute(props, "data-required")).toBeUndefined();
    dispose();
  });

  it("reflects the calendar-wide flags", () => {
    const { props, dispose } = setup({ disabled: true, readOnly: true, required: true });
    expect(attribute(props, "data-disabled")).toBe("");
    expect(attribute(props, "data-readonly")).toBe("");
    expect(attribute(props, "data-required")).toBe("");
    dispose();
  });

  it("takes the accessible name from the label option, and yields to the consumer's own", () => {
    const labelled = setup({ label: "Trip dates" });
    expect(labelled.props["aria-label"]).toBe("Trip dates");
    labelled.dispose();

    const overridden = setup({ label: "Trip dates" }, { "aria-label": "Departure" });
    expect(overridden.props["aria-label"]).toBe("Departure");
    overridden.dispose();
  });
});

describe("createCalendarGroup — focus leaving the calendar", () => {
  // Stands in for a container that has already been removed, so the deferred decision always bails on
  // `isConnected` before it can reach `document` — which does not exist in the `unit` project.
  const detachedContainer = { isConnected: false, contains: () => false };

  it("is inert with no range in progress — it never even looks at where focus went", () => {
    const onValueChange = vi.fn();
    const { api, props, dispose } = setup({ selectionMode: "single", onValueChange });
    flush(() => api.activate(new CalendarDate(2026, 1, 10)));
    onValueChange.mockClear();

    // A `null` container would throw if the handler got past its anchor guard.
    focusOut(props, null);
    expect(api.selectionValue()?.toString()).toBe("2026-01-10");
    expect(onValueChange).not.toHaveBeenCalled();
    dispose();
  });

  it("runs the consumer's own handler first, and lets it cancel", () => {
    const consumerHandler = vi.fn((event: FocusEvent) => event.preventDefault());
    const { api, props, dispose } = setup({}, { onFocusOut: consumerHandler });
    flush(() => api.activate(new CalendarDate(2026, 1, 10)));

    // `composeEventHandlers` stops at a `preventDefault()`, so the internal handler never runs — and
    // the `null` container it would have read is never touched.
    const handler = props.onFocusOut as (event: FocusEvent) => void;
    const event = { defaultPrevented: false, currentTarget: null } as unknown as FocusEvent;
    Object.assign(event, {
      preventDefault: () => Object.assign(event, { defaultPrevented: true }),
    });
    flush(() => handler(event));

    expect(consumerHandler).toHaveBeenCalledTimes(1);
    expect(api.anchorDate()?.toString()).toBe("2026-01-10");
    dispose();
  });

  it("defers the decision, and drops it when the calendar is already gone", async () => {
    const onValueChange = vi.fn();
    const { api, props, dispose } = setup({ onValueChange });
    flush(() => api.activate(new CalendarDate(2026, 1, 10)));

    focusOut(props, detachedContainer);
    // Nothing happens synchronously: the handler only schedules.
    expect(api.anchorDate()?.toString()).toBe("2026-01-10");

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(api.anchorDate()?.toString()).toBe("2026-01-10");
    expect(onValueChange).not.toHaveBeenCalled();
    dispose();
  });
});
