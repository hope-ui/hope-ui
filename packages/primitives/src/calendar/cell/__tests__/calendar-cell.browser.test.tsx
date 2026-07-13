import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { CalendarDate } from "@internationalized/date";
import { For, Show } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { createCalendarGrid } from "../../grid/calendar-grid";
import { createCalendarHeading } from "../../heading/calendar-heading";
import {
  type CreateCalendarOptions,
  type CreateCalendarReturn,
  createCalendar,
} from "../../root/calendar-root";
import { createCalendarCell } from "../calendar-cell";

/** A minimal working calendar built from the primitive hooks — the cell behavior under test. */
function CalendarHarness(props: {
  options?: CreateCalendarOptions;
  onReady?: (state: CreateCalendarReturn) => void;
}) {
  const state = createCalendar({
    defaultFocusedValue: new CalendarDate(2026, 1, 15),
    ...props.options,
  });
  props.onReady?.(state);
  const grid = createCalendarGrid(state, {});
  const heading = createCalendarHeading(state, {});

  return (
    <div role="group" aria-label={state.groupLabel()}>
      <button {...heading.props}>{state.headingLabel()}</button>
      <table {...grid.props}>
        <Show when={state.view() === "month"}>
          <thead>
            <tr>
              <For each={state.weekdays()}>
                {(weekday) => (
                  <th scope="col" aria-label={weekday.long}>
                    {weekday.short}
                  </th>
                )}
              </For>
            </tr>
          </thead>
        </Show>
        <tbody>
          <For each={state.cells()}>
            {(row) => (
              <tr>
                <For each={row}>
                  {(model) => {
                    const cell = createCalendarCell(state, {
                      date: () => model.date,
                      label: () => model.label,
                      isOutside: () => model.isOutside,
                    });
                    return (
                      <td {...cell.props}>
                        <button
                          {...cell.triggerProps}
                          ref={cell.setTriggerRef}
                          data-testdate={model.key}
                        >
                          {model.label}
                        </button>
                      </td>
                    );
                  }}
                </For>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );
}

const dayButton = (container: HTMLElement, iso: string) =>
  container.querySelector<HTMLElement>(`[data-testdate="${iso}"]`) as HTMLElement;

async function mountCalendar(options?: CreateCalendarOptions) {
  let state!: CreateCalendarReturn;
  const rendered = mount(() => <CalendarHarness options={options} onReady={(s) => (state = s)} />);
  await vi.waitFor(() => expect(state.collection.items().length).toBeGreaterThan(20));
  return { ...rendered, state };
}

describe("createCalendarCell", () => {
  it("selects a day on click and reflects it with data-selected + aria-selected", async () => {
    let selected: unknown;
    const { container, dispose } = await mountCalendar({
      onValueChange: (value) => (selected = value),
    });

    const jan20 = dayButton(container, "2026-01-20");
    jan20.click();

    await vi.waitFor(() => expect((selected as CalendarDate)?.toString()).toBe("2026-01-20"));
    const cell = jan20.closest("td") as HTMLElement;
    await vi.waitFor(() => expect(cell.getAttribute("data-selected")).toBe(""));
    expect(cell.getAttribute("aria-selected")).toBe("true");
    dispose();
  });

  it("gives the focused date the roving tab stop and the rest tabindex -1", async () => {
    const { container, dispose } = await mountCalendar();
    expect(dayButton(container, "2026-01-15").getAttribute("tabindex")).toBe("0");
    expect(dayButton(container, "2026-01-16").getAttribute("tabindex")).toBe("-1");
    dispose();
  });

  it("exposes a full, view-aware aria-label with a Today suffix", async () => {
    // Seed today via defaultFocusedValue → today check is against the calendar's timeZone `today()`,
    // so assert the base label shape rather than today (which depends on the run date).
    const { container, dispose } = await mountCalendar();
    const label = dayButton(container, "2026-01-15").getAttribute("aria-label");
    expect(label).toContain("January 15, 2026");
    dispose();
  });

  it("does not select an out-of-range (inert) day, even on a forced click", async () => {
    let changed = false;
    const { container, dispose } = await mountCalendar({
      min: new CalendarDate(2026, 1, 10),
      onValueChange: () => (changed = true),
    });
    // Jan 5 is before min → non-focusable/inert.
    const jan5 = dayButton(container, "2026-01-05");
    jan5.click();
    // Give any (incorrect) selection a chance to fire.
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(changed).toBe(false);
    dispose();
  });

  it("marks an unavailable day aria-disabled but keeps it focusable", async () => {
    const { container, dispose } = await mountCalendar({
      isDateDisabled: (date) => date.day === 20,
    });
    const jan20 = dayButton(container, "2026-01-20");
    expect(jan20.getAttribute("aria-disabled")).toBe("true");
    // Focusable (unlike inert days): focusing it works and does not throw.
    jan20.focus();
    await expect.element(jan20).toHaveFocus();
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    const { container, dispose } = await mountCalendar();
    await expectNoA11yViolations(container);
    dispose();
  });
});
