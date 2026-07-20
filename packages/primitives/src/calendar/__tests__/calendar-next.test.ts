import { CalendarDate } from "@internationalized/date";
import { createRoot, flush } from "solid-js";
import { describe, expect, it } from "vitest";
import { createCalendarNext } from "../calendar-next";
import { type CreateCalendarReturn, createCalendar } from "../calendar-root";

function setup(options = {}) {
  let api!: CreateCalendarReturn;
  let next!: ReturnType<typeof createCalendarNext>;
  let dispose!: () => void;
  createRoot((d) => {
    dispose = d;
    api = createCalendar({ defaultFocusedValue: new CalendarDate(2026, 6, 15), ...options });
    next = createCalendarNext(api, {});
  });
  return { api, next, dispose };
}

const click = (handler: unknown) => (handler as (e: unknown) => void)({ defaultPrevented: false });
const dataDisabled = (props: object) => (props as Record<string, unknown>)["data-disabled"];

describe("createCalendarNext", () => {
  it("is a button labelled from the i18n defaults", () => {
    const { next, dispose } = setup();
    expect(next.props.type).toBe("button");
    expect(next.props["aria-label"]).toBe("Next");
    dispose();
  });

  it("pages the calendar forward on click", () => {
    const { api, next, dispose } = setup();
    flush(() => click(next.props.onClick));
    expect(api.visibleMonth().toString()).toBe("2026-07-01");
    dispose();
  });

  it("reflects the max boundary via disabled + data-disabled", () => {
    const { next, dispose } = setup({ max: new CalendarDate(2026, 6, 30) });
    expect(next.props.disabled).toBe(true);
    expect(dataDisabled(next.props)).toBe("true");
    dispose();
  });
});
