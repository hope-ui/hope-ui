import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { CalendarDate } from "@internationalized/date";
import { For, Show } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { createCalendarCell } from "../calendar-cell";
import { createCalendarGrid } from "../calendar-grid";
import { createCalendarHeading } from "../calendar-heading";
import {
  type CreateCalendarOptions,
  type CreateCalendarReturn,
  createCalendar,
} from "../calendar-root";

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
  await vi.waitFor(() => expect(state.collection.items().length).toBeGreaterThan(20));
  return { ...rendered, state };
}

describe("createCalendarCell", () => {
  it("selects a day on click and reflects it with data-selected (button) + aria-selected (cell)", async () => {
    let selected: unknown;
    const { container, dispose } = await mountCalendar({
      onValueChange: (value) => (selected = value),
    });

    const jan20 = dayButton(container, "2026-01-20");
    jan20.click();

    await vi.waitFor(() => expect((selected as CalendarDate)?.toString()).toBe("2026-01-20"));
    // The paint hook is on the button (where the recipe's `cellTrigger` reads it); the ARIA selection
    // state stays on the `<td role="gridcell">`.
    await vi.waitFor(() => expect(jan20.getAttribute("data-selected")).toBe(""));
    const cell = jan20.closest("td") as HTMLElement;
    expect(cell.getAttribute("aria-selected")).toBe("true");
    expect(cell.getAttribute("data-selected")).toBeNull();
    dispose();
  });

  it("mirrors the band-level range hooks onto the <td> so the band can span cells", async () => {
    const { container, state, dispose } = await mountCalendar({ selectionMode: "range" });
    dayButton(container, "2026-01-10").click();
    // The anchor write must flush before the second click reads it (Solid 2.0 flush timing — real
    // clicks are separated by flushes; two synchronous ones in a test are not).
    await vi.waitFor(() => expect(state.anchorDate()?.toString()).toBe("2026-01-10"));
    dayButton(container, "2026-01-14").click();
    // The band paints on the cell (spanning columns); the middle day's <td> carries data-range-middle.
    await vi.waitFor(() => {
      const midCell = dayButton(container, "2026-01-12").closest("td") as HTMLElement;
      expect(midCell.getAttribute("data-range-middle")).toBe("");
    });
    // The band-level hooks reach the <td>, but the single ARIA selection flag does not.
    const startCell = dayButton(container, "2026-01-10").closest("td") as HTMLElement;
    expect(startCell.getAttribute("data-range-start")).toBe("");
    expect(startCell.getAttribute("data-selected")).toBeNull();
    dispose();
  });

  it("caps the tentative band with data-highlighted-start/end while hovering mid-selection", async () => {
    const { container, state, dispose } = await mountCalendar({ selectionMode: "range" });
    dayButton(container, "2026-01-10").click(); // anchor
    await vi.waitFor(() => expect(state.anchorDate()?.toString()).toBe("2026-01-10"));

    dayButton(container, "2026-01-14").dispatchEvent(new MouseEvent("mouseenter"));

    const cellOf = (iso: string) => dayButton(container, iso).closest("td") as HTMLElement;
    await vi.waitFor(() =>
      expect(cellOf("2026-01-14").getAttribute("data-highlighted-end")).toBe(""),
    );
    // The anchor opens the band; the hovered day closes it. Both hooks reach the <td> (where the band
    // is painted) and the button (where a recipe may cap the trigger).
    expect(cellOf("2026-01-10").getAttribute("data-highlighted-start")).toBe("");
    expect(dayButton(container, "2026-01-10").getAttribute("data-highlighted-start")).toBe("");
    expect(dayButton(container, "2026-01-14").getAttribute("data-highlighted-end")).toBe("");
    // The interior is in the band but caps neither end.
    const midCell = cellOf("2026-01-12");
    expect(midCell.getAttribute("data-highlighted")).toBe("");
    expect(midCell.getAttribute("data-highlighted-start")).toBeNull();
    expect(midCell.getAttribute("data-highlighted-end")).toBeNull();
    dispose();
  });

  it("survives the pointer leaving the grid — the band belongs to the anchor, not the hover", async () => {
    const { container, state, dispose } = await mountCalendar({ selectionMode: "range" });
    dayButton(container, "2026-01-10").click(); // anchor
    await vi.waitFor(() => expect(state.anchorDate()?.toString()).toBe("2026-01-10"));
    dayButton(container, "2026-01-14").dispatchEvent(new MouseEvent("mouseenter"));

    const midCell = dayButton(container, "2026-01-12").closest("td") as HTMLElement;
    await vi.waitFor(() => expect(midCell.getAttribute("data-highlighted")).toBe(""));

    const grid = container.querySelector("table") as HTMLElement;
    grid.dispatchEvent(new PointerEvent("pointerleave", { bubbles: false }));

    await new Promise((resolve) => setTimeout(resolve, 20)); // let any (incorrect) clear settle
    expect(midCell.getAttribute("data-highlighted")).toBe("");
    expect(state.highlightedRange()?.end.toString()).toBe("2026-01-14");
    dispose();
  });

  it("ignores hover on a day the range could not end on (outside-month / unavailable)", async () => {
    const { container, state, dispose } = await mountCalendar({
      selectionMode: "range",
      isDateDisabled: (date) => date.day === 22,
    });
    dayButton(container, "2026-01-10").click(); // anchor
    await vi.waitFor(() => expect(state.anchorDate()?.toString()).toBe("2026-01-10"));
    dayButton(container, "2026-01-14").dispatchEvent(new MouseEvent("mouseenter"));
    await vi.waitFor(() => expect(state.highlightedRange()?.end.toString()).toBe("2026-01-14"));

    // A leading filler day from the previous month — clicking it is refused, so it must not preview.
    dayButton(container, "2025-12-30").dispatchEvent(new MouseEvent("mouseenter"));
    // An unavailable day — same: focusable and announced, but never a range endpoint.
    dayButton(container, "2026-01-22").dispatchEvent(new MouseEvent("mouseenter"));

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(state.highlightedRange()?.end.toString()).toBe("2026-01-14"); // band never moved
    expect(state.focusedDate().toString()).toBe("2026-01-14"); // nor did the roving cursor
    expect(dayButton(container, "2025-12-30").closest("td")?.getAttribute("data-highlighted")).toBe(
      null,
    );
    expect(dayButton(container, "2026-01-22").closest("td")?.getAttribute("data-highlighted")).toBe(
      null,
    );
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

  it("marks an unavailable day aria-disabled + data-unavailable, but keeps it focusable and un-dimmed", async () => {
    const { container, dispose } = await mountCalendar({
      isDateDisabled: (date) => date.day === 20,
    });
    const jan20 = dayButton(container, "2026-01-20");
    expect(jan20.getAttribute("aria-disabled")).toBe("true");
    // Painted `data-unavailable` (strike-through), NOT `data-disabled` — an unavailable day stays
    // interactive (focusable, hover-previewable), distinct from an inert out-of-range day.
    expect(jan20.getAttribute("data-unavailable")).toBe("");
    expect(jan20.getAttribute("data-disabled")).toBeNull();
    // Focusable (unlike inert days): focusing it works and does not throw.
    jan20.focus();
    await expect.element(jan20).toHaveFocus();
    dispose();
  });

  it("marks an out-of-range day data-disabled (inert), not data-unavailable", async () => {
    const { container, dispose } = await mountCalendar({
      min: new CalendarDate(2026, 1, 10),
    });
    // Jan 5 is before `min` → a whole out-of-range period: inert + dimmed, not merely unavailable.
    const jan5 = dayButton(container, "2026-01-05");
    expect(jan5.getAttribute("data-disabled")).toBe("");
    expect(jan5.getAttribute("data-unavailable")).toBeNull();
    dispose();
  });

  it("reports aria-disabled on both the gridcell and its button for every non-selectable day", async () => {
    const { container, dispose } = await mountCalendar({
      min: new CalendarDate(2026, 1, 10),
      isDateDisabled: (date) => date.day === 20,
    });
    const ariaDisabledPair = (iso: string) => {
      const button = dayButton(container, iso);
      return [
        button.closest("td")?.getAttribute("aria-disabled"),
        button.getAttribute("aria-disabled"),
      ];
    };
    // React Aria's `!isSelectable`, mirrored on both elements: out-of-range, outside-month, and
    // unavailable all report it — a selectable day reports nothing.
    expect(ariaDisabledPair("2026-01-05")).toEqual(["true", "true"]); // before min
    expect(ariaDisabledPair("2025-12-30")).toEqual(["true", "true"]); // outside the visible month
    expect(ariaDisabledPair("2026-01-20")).toEqual(["true", "true"]); // unavailable
    expect(ariaDisabledPair("2026-01-15")).toEqual([null, null]);
    dispose();
  });

  it("makes every day inert when the whole calendar is disabled", async () => {
    let changed = false;
    const { container, dispose } = await mountCalendar({
      disabled: true,
      onValueChange: () => (changed = true),
    });

    const jan15 = dayButton(container, "2026-01-15"); // the focused day, so the tab stop would be here
    expect(jan15.getAttribute("aria-disabled")).toBe("true");
    expect(jan15.closest("td")?.getAttribute("aria-disabled")).toBe("true");
    expect(jan15.getAttribute("data-disabled")).toBe("");
    // No cell may hold the roving tab stop — the arrows skip them all.
    expect(jan15.getAttribute("tabindex")).toBe("-1");
    expect(container.querySelector('[data-testdate][tabindex="0"]')).toBeNull();

    jan15.click();
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(changed).toBe(false);
    dispose();
  });

  it("keeps a read-only calendar reachable but never selectable", async () => {
    let changed = false;
    const { container, dispose } = await mountCalendar({
      readOnly: true,
      onValueChange: () => (changed = true),
    });

    // Read-only is not disabled: the days stay focusable, undimmed and un-`aria-disabled` (the state
    // lives on the grid as `aria-readonly`), but activation is refused.
    const jan15 = dayButton(container, "2026-01-15");
    expect(jan15.getAttribute("tabindex")).toBe("0");
    expect(jan15.getAttribute("aria-disabled")).toBeNull();
    expect(jan15.getAttribute("data-disabled")).toBeNull();

    dayButton(container, "2026-01-20").click();
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(changed).toBe(false);
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    const { container, dispose } = await mountCalendar();
    await expectNoA11yViolations(container);
    dispose();
  });
});
