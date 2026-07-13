import { CalendarDate } from "@internationalized/date";
import { createRoot, flush } from "solid-js";
import { describe, expect, it } from "vitest";
import { type CreateCalendarReturn, createCalendar } from "../root/calendar-root";
import { createCalendarPrev } from "./calendar-prev";

function setup(options = {}) {
  let api!: CreateCalendarReturn;
  let prev!: ReturnType<typeof createCalendarPrev>;
  let dispose!: () => void;
  createRoot((d) => {
    dispose = d;
    api = createCalendar({ defaultFocusedValue: new CalendarDate(2026, 6, 15), ...options });
    prev = createCalendarPrev(api, {});
  });
  return { api, prev, dispose };
}

const click = (handler: unknown) => (handler as (e: unknown) => void)({ defaultPrevented: false });
const dataDisabled = (props: object) => (props as Record<string, unknown>)["data-disabled"];

describe("createCalendarPrev", () => {
  it("is a button labelled from the i18n defaults", () => {
    const { prev, dispose } = setup();
    expect(prev.props.type).toBe("button");
    expect(prev.props["aria-label"]).toBe("Previous");
    dispose();
  });

  it("pages the calendar back on click", () => {
    const { api, prev, dispose } = setup();
    flush(() => click(prev.props.onClick));
    expect(api.visibleMonth().toString()).toBe("2026-05-01");
    dispose();
  });

  it("reflects the min boundary via disabled + data-disabled", () => {
    const { prev, dispose } = setup({ min: new CalendarDate(2026, 6, 1) });
    expect(prev.props.disabled).toBe(true);
    expect(dataDisabled(prev.props)).toBe("true");
    dispose();
  });

  it("is not disabled away from the boundary", () => {
    const { prev, dispose } = setup();
    expect(prev.props.disabled).toBeUndefined();
    expect(dataDisabled(prev.props)).toBeUndefined();
    dispose();
  });
});
