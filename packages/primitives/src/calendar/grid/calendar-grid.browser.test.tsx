import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { CalendarDate } from "@internationalized/date";
import { For, Show } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { createCalendarCell } from "../cell/calendar-cell";
import { createCalendarHeading } from "../heading/calendar-heading";
import { createCalendarNext } from "../next/calendar-next";
import { createCalendarPrev } from "../prev/calendar-prev";
import {
  type CreateCalendarOptions,
  type CreateCalendarReturn,
  createCalendar,
} from "../root/calendar-root";
import { createCalendarGrid } from "./calendar-grid";

/** A minimal working calendar built from the primitive hooks — the grid + cell behavior under test. */
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
  const prev = createCalendarPrev(state, {});
  const heading = createCalendarHeading(state, {});
  const next = createCalendarNext(state, {});

  return (
    <div role="group" aria-label={state.groupLabel()}>
      <div>
        <button {...prev.props}>‹</button>
        <button {...heading.props}>{state.headingLabel()}</button>
        <button {...next.props}>›</button>
      </div>
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
  // Wait for the cells to register into the collection (roving needs them mounted).
  await vi.waitFor(() => expect(state.collection.items().length).toBeGreaterThan(20));
  return { ...rendered, state };
}

describe("createCalendarGrid — roving arrow navigation", () => {
  it("moves the roving focus day-by-day, wrapping across weeks", async () => {
    const { container, dispose } = await mountCalendar();
    dayButton(container, "2026-01-15").focus();
    await expect.element(dayButton(container, "2026-01-15")).toHaveFocus();

    await userEvent.keyboard("{ArrowRight}");
    await expect.element(dayButton(container, "2026-01-16")).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect.element(dayButton(container, "2026-01-23")).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect.element(dayButton(container, "2026-01-22")).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}");
    await expect.element(dayButton(container, "2026-01-15")).toHaveFocus();
    dispose();
  });

  it("Home/End move to the first/last day of the week", async () => {
    const { container, dispose } = await mountCalendar();
    dayButton(container, "2026-01-15").focus(); // a Thursday
    await userEvent.keyboard("{End}");
    // The week containing Jan 15 2026 (Sun-start) ends on Saturday Jan 17.
    await expect.element(dayButton(container, "2026-01-17")).toHaveFocus();
    await userEvent.keyboard("{Home}");
    await expect.element(dayButton(container, "2026-01-11")).toHaveFocus();
    dispose();
  });

  it("crosses into the next month on an arrow off the last day", async () => {
    const { container, state, dispose } = await mountCalendar({
      defaultFocusedValue: new CalendarDate(2026, 1, 31),
    });
    dayButton(container, "2026-01-31").focus();
    await userEvent.keyboard("{ArrowRight}"); // Jan 31 → Feb 1 (crosses)
    await vi.waitFor(() => expect(state.visibleMonth().toString()).toBe("2026-02-01"));
    await expect.element(dayButton(container, "2026-02-01")).toHaveFocus();
    dispose();
  });

  it("flips arrow direction under RTL", async () => {
    const { container, dispose } = await mountCalendar({ dir: "rtl" });
    dayButton(container, "2026-01-15").focus();
    await userEvent.keyboard("{ArrowRight}"); // RTL → previous day
    await expect.element(dayButton(container, "2026-01-14")).toHaveFocus();
    dispose();
  });

  it("PageDown pages to the next month", async () => {
    const { container, state, dispose } = await mountCalendar();
    dayButton(container, "2026-01-15").focus();
    await userEvent.keyboard("{PageDown}");
    await vi.waitFor(() => expect(state.visibleMonth().toString()).toBe("2026-02-01"));
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    const { container, dispose } = await mountCalendar();
    await expectNoA11yViolations(container);
    dispose();
  });
});
