import { CalendarDate } from "@internationalized/date";
import { createRoot, flush } from "solid-js";
import { describe, expect, it } from "vitest";
import { createCalendarHeading } from "../calendar-heading";
import { type CreateCalendarReturn, createCalendar } from "../calendar-root";

function setup() {
  let api!: CreateCalendarReturn;
  let heading!: ReturnType<typeof createCalendarHeading>;
  let dispose!: () => void;
  createRoot((d) => {
    dispose = d;
    api = createCalendar({ defaultFocusedValue: new CalendarDate(2026, 6, 15) });
    heading = createCalendarHeading(api, {});
  });
  return { api, heading, dispose };
}

const click = (handler: unknown) => (handler as (e: unknown) => void)({ defaultPrevented: false });
const dataDisabled = (props: object) => (props as Record<string, unknown>)["data-disabled"];

describe("createCalendarHeading", () => {
  it("carries the calendar's headingId (for the grid's aria-labelledby)", () => {
    const { api, heading, dispose } = setup();
    expect(heading.props.type).toBe("button");
    expect(heading.props.id).toBe(api.headingId());
    dispose();
  });

  it("drills up the view stack on click", () => {
    const { api, heading, dispose } = setup();
    expect(api.view()).toBe("month");
    flush(() => click(heading.props.onClick));
    expect(api.view()).toBe("year");
    dispose();
  });

  it("is disabled at the top of the stack (decade)", () => {
    const { api, heading, dispose } = setup();
    expect(heading.props.disabled).toBeUndefined();
    flush(() => api.setView("decade"));
    expect(heading.props.disabled).toBe(true);
    expect(dataDisabled(heading.props)).toBe("true");
    dispose();
  });
});
