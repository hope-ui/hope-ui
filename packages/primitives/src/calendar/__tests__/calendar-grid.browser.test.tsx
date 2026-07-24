import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { CalendarDate } from "@internationalized/date";
import { For, Show } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { createCalendarCell } from "../calendar-cell";
import { createCalendarGrid } from "../calendar-grid";
import { createCalendarHeading } from "../calendar-heading";
import { createCalendarNext } from "../calendar-next";
import { createCalendarPrev } from "../calendar-prev";
import {
  type CreateCalendarOptions,
  type CreateCalendarReturn,
  createCalendar,
} from "../calendar-root";

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
          <thead {...grid.headerProps}>
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

  it("grows the tentative range band as the arrow keys move the cursor", async () => {
    const { container, state, dispose } = await mountCalendar({ selectionMode: "range" });
    dayButton(container, "2026-01-15").click(); // anchor, with the pointer never leaving that cell
    await vi.waitFor(() => expect(state.anchorDate()?.toString()).toBe("2026-01-15"));

    dayButton(container, "2026-01-15").focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect.element(dayButton(container, "2026-01-16")).toHaveFocus();

    const cellOf = (iso: string) => dayButton(container, iso).closest("td") as HTMLElement;
    await vi.waitFor(() => expect(cellOf("2026-01-16").getAttribute("data-highlighted")).toBe(""));
    expect(cellOf("2026-01-16").getAttribute("data-highlighted-end")).toBe("");
    expect(cellOf("2026-01-15").getAttribute("data-highlighted-start")).toBe("");

    await userEvent.keyboard("{ArrowRight}");
    await vi.waitFor(() => expect(cellOf("2026-01-17").getAttribute("data-highlighted")).toBe(""));
    expect(cellOf("2026-01-16").getAttribute("data-highlighted")).toBe(""); // now the interior
    expect(cellOf("2026-01-16").getAttribute("data-highlighted-end")).toBeNull();
    expect(state.highlightedRange()?.end.toString()).toBe("2026-01-17");
    dispose();
  });

  it("Escape cancels the range in progress and puts the previous selection back", async () => {
    const onValueChange = vi.fn();
    const { container, state, dispose } = await mountCalendar({
      selectionMode: "range",
      defaultValue: { start: new CalendarDate(2026, 1, 2), end: new CalendarDate(2026, 1, 4) },
      onValueChange,
    });
    dayButton(container, "2026-01-15").focus();
    await userEvent.keyboard("{Enter}"); // anchor
    await vi.waitFor(() => expect(state.anchorDate()?.toString()).toBe("2026-01-15"));
    await userEvent.keyboard("{ArrowRight}");
    const cellOf = (iso: string) => dayButton(container, iso).closest("td") as HTMLElement;
    await vi.waitFor(() => expect(cellOf("2026-01-16").getAttribute("data-highlighted")).toBe(""));

    // Capture phase, so the assertion still sees the event when the handler stops it propagating.
    const seen: KeyboardEvent[] = [];
    const spy = (event: KeyboardEvent) => seen.push(event);
    document.addEventListener("keydown", spy, true);
    await userEvent.keyboard("{Escape}");
    document.removeEventListener("keydown", spy, true);

    await vi.waitFor(() => expect(state.anchorDate()).toBeNull());
    expect(state.highlightedRange()).toBeNull();
    expect(cellOf("2026-01-16").getAttribute("data-highlighted")).toBeNull();
    // The range committed before the abandoned one comes back, and nothing was emitted: the consumer
    // was never told about the in-progress value in the first place.
    const value = state.selectionValue() as { start: CalendarDate; end: CalendarDate };
    expect(value.start.toString()).toBe("2026-01-02");
    expect(value.end.toString()).toBe("2026-01-04");
    expect(onValueChange).not.toHaveBeenCalled();
    // Consumed, so the same keypress can't also close the popover the calendar sits in.
    expect(seen.at(-1)?.defaultPrevented).toBe(true);
    dispose();
  });

  it("leaves Escape alone when there is no range to cancel", async () => {
    const { container, dispose } = await mountCalendar({ selectionMode: "range" });
    dayButton(container, "2026-01-15").focus();

    const seen: KeyboardEvent[] = [];
    const spy = (event: KeyboardEvent) => seen.push(event);
    document.addEventListener("keydown", spy, true);
    await userEvent.keyboard("{Escape}");
    document.removeEventListener("keydown", spy, true);

    // Untouched, so an enclosing popover/dialog still gets to close on it.
    expect(seen.at(-1)?.defaultPrevented).toBe(false);
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

describe("createCalendarGrid — grid ARIA", () => {
  const grid = (container: HTMLElement) => container.querySelector("table") as HTMLElement;

  it("omits the state flags a plain single-select calendar does not carry", async () => {
    const { container, dispose } = await mountCalendar();
    expect(grid(container).getAttribute("aria-readonly")).toBeNull();
    expect(grid(container).getAttribute("aria-disabled")).toBeNull();
    expect(grid(container).getAttribute("aria-multiselectable")).toBeNull();
    dispose();
  });

  it("reflects readOnly, disabled and a non-single selection mode", async () => {
    const { container, dispose } = await mountCalendar({
      readOnly: true,
      disabled: true,
      selectionMode: "range",
    });
    expect(grid(container).getAttribute("aria-readonly")).toBe("true");
    expect(grid(container).getAttribute("aria-disabled")).toBe("true");
    expect(grid(container).getAttribute("aria-multiselectable")).toBe("true");
    // The container tab stop goes too, so a disabled calendar is skipped entirely by Tab.
    expect(grid(container).getAttribute("tabindex")).toBe("-1");
    dispose();
  });

  it("marks multiple-selection calendars multiselectable too", async () => {
    const { container, dispose } = await mountCalendar({ selectionMode: "multiple" });
    expect(grid(container).getAttribute("aria-multiselectable")).toBe("true");
    dispose();
  });

  it("hides the weekday header row, which every cell's aria-label already names", async () => {
    const { container, dispose } = await mountCalendar();
    expect(container.querySelector("thead")?.getAttribute("aria-hidden")).toBe("true");
    // The weekday is not lost — it leads each day's accessible name.
    expect(dayButton(container, "2026-01-15").getAttribute("aria-label")).toContain("Thursday");
    await expectNoA11yViolations(container);
    dispose();
  });
});
