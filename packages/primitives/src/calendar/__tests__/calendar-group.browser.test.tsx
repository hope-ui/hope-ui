import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { CalendarDate } from "@internationalized/date";
import { For } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { createCalendarCell } from "../calendar-cell";
import { createCalendarGrid } from "../calendar-grid";
import { createCalendarGroup } from "../calendar-group";
import { createCalendarHeading } from "../calendar-heading";
import { createCalendarNext } from "../calendar-next";
import {
  type CreateCalendarOptions,
  type CreateCalendarReturn,
  createCalendar,
} from "../calendar-root";
import type { CalendarValue } from "../utils/selection";

/**
 * A range calendar with two things beside it: a focusable button (pressing it takes focus out of the
 * calendar) and an inert area that refuses focus on mousedown (pressing it leaves focus where it is).
 * The two exercise the abandonment policy's two halves separately — `focusout` and outside `pointerup`
 * — which a single "click outside" cannot, because whichever fires first resolves the range and the
 * other then finds nothing to do.
 */
function CalendarHarness(props: {
  options?: CreateCalendarOptions;
  onReady?: (state: CreateCalendarReturn) => void;
}) {
  const state = createCalendar({
    selectionMode: "range",
    defaultFocusedValue: new CalendarDate(2026, 1, 15),
    ...props.options,
  });
  props.onReady?.(state);
  const group = createCalendarGroup(state);
  const grid = createCalendarGrid(state, {});
  const heading = createCalendarHeading(state, {});
  const next = createCalendarNext(state, {});

  return (
    <div>
      <div {...group.props} ref={group.setRef}>
        {/* The heading owns the id the grid's `aria-labelledby` points at, so it is not optional
        chrome here — without it the grid names an element that does not exist. */}
        <button {...heading.props}>{state.headingLabel()}</button>
        <button {...next.props} data-testid="next">
          ›
        </button>
        <table {...grid.props}>
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
      <button type="button" data-testid="outside">
        Outside
      </button>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: a press target with no behavior of its
      own — it only declines the focus a press would otherwise move, which is what isolates the
      outside-`pointerup` half of the policy from the focus-out half. */}
      <div data-testid="outside-inert" onMouseDown={(event) => event.preventDefault()}>
        Inert
      </div>
    </div>
  );
}

const dayButton = (container: HTMLElement, iso: string) =>
  container.querySelector<HTMLElement>(`[data-testdate="${iso}"]`) as HTMLElement;
const testId = (container: HTMLElement, id: string) =>
  container.querySelector<HTMLElement>(`[data-testid="${id}"]`) as HTMLElement;

async function mountCalendar(options?: CreateCalendarOptions) {
  let state!: CreateCalendarReturn;
  const rendered = mount(() => <CalendarHarness options={options} onReady={(s) => (state = s)} />);
  await vi.waitFor(() => expect(state.collection.items().length).toBeGreaterThan(20));
  return { ...rendered, state };
}

/** Anchor a range on Jan 10 from the keyboard, then aim its moving end at Jan 14. */
async function anchorAndAim(container: HTMLElement, state: CreateCalendarReturn) {
  dayButton(container, "2026-01-10").focus();
  await userEvent.keyboard("{Enter}");
  await vi.waitFor(() => expect(state.anchorDate()?.toString()).toBe("2026-01-10"));
  await userEvent.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}");
  await vi.waitFor(() => expect(state.focusedDate().toString()).toBe("2026-01-14"));
}

const asRange = (value: CalendarValue) =>
  value as { start: CalendarDate; end: CalendarDate } | null;

describe("createCalendarGroup — a range abandoned mid-selection", () => {
  it("commits the tentative range when the pointer is released outside", async () => {
    const onValueChange = vi.fn();
    const { container, state, dispose } = await mountCalendar({ onValueChange });
    await anchorAndAim(container, state);

    // The inert target declines focus, so the calendar still holds it when the press is released —
    // React Aria's `isFocusWithin` case, and the only one the pointer half decides on its own.
    await userEvent.click(testId(container, "outside-inert"));

    await vi.waitFor(() => expect(state.anchorDate()).toBeNull());
    expect(asRange(state.selectionValue())?.start.toString()).toBe("2026-01-10");
    expect(asRange(state.selectionValue())?.end.toString()).toBe("2026-01-14");
    expect(onValueChange).toHaveBeenCalledTimes(1);
    dispose();
  });

  it("commits the tentative range when focus leaves the calendar", async () => {
    const onValueChange = vi.fn();
    const { container, state, dispose } = await mountCalendar({ onValueChange });
    await anchorAndAim(container, state);

    testId(container, "outside").focus();

    await vi.waitFor(() => expect(state.anchorDate()).toBeNull());
    expect(asRange(state.selectionValue())?.end.toString()).toBe("2026-01-14");
    expect(onValueChange).toHaveBeenCalledTimes(1);
    dispose();
  });

  it("clears the selection instead under commitBehavior clear", async () => {
    const { container, state, dispose } = await mountCalendar({
      commitBehavior: "clear",
      defaultValue: { start: new CalendarDate(2026, 1, 2), end: new CalendarDate(2026, 1, 4) },
    });
    await anchorAndAim(container, state);

    testId(container, "outside").focus();

    await vi.waitFor(() => expect(state.selectionValue()).toBeNull());
    expect(state.anchorDate()).toBeNull();
    dispose();
  });

  it("restores the previous range instead under commitBehavior reset", async () => {
    const { container, state, dispose } = await mountCalendar({
      commitBehavior: "reset",
      defaultValue: { start: new CalendarDate(2026, 1, 2), end: new CalendarDate(2026, 1, 4) },
    });
    await anchorAndAim(container, state);

    testId(container, "outside").focus();

    await vi.waitFor(() => expect(state.anchorDate()).toBeNull());
    expect(asRange(state.selectionValue())?.start.toString()).toBe("2026-01-02");
    expect(asRange(state.selectionValue())?.end.toString()).toBe("2026-01-04");
    dispose();
  });

  it("keeps the range in progress when the calendar's own nav is pressed", async () => {
    // The `button` exemption: paging the month mid-selection is not walking away, so a range spanning
    // two months stays possible.
    const onValueChange = vi.fn();
    const { container, state, dispose } = await mountCalendar({ onValueChange });
    await anchorAndAim(container, state);

    await userEvent.click(testId(container, "next"));

    await vi.waitFor(() => expect(state.visibleMonth().toString()).toBe("2026-02-01"));
    expect(state.anchorDate()?.toString()).toBe("2026-01-10");
    expect(onValueChange).not.toHaveBeenCalled();
    dispose();
  });

  it("keeps the range in progress when the keyboard pages the month", async () => {
    // Every cell is rebuilt, so the focused day button is destroyed under the user: a `focusout` with
    // no `relatedTarget` fires from a node already out of the document, and the grid's deferred nudge
    // then focuses the replacement. Committing on that would end the range on every PageDown.
    const onValueChange = vi.fn();
    const { container, state, dispose } = await mountCalendar({ onValueChange });
    await anchorAndAim(container, state);

    await userEvent.keyboard("{PageDown}");

    await vi.waitFor(() => expect(state.visibleMonth().toString()).toBe("2026-02-01"));
    await vi.waitFor(() => expect(dayButton(container, "2026-02-14")).toBe(document.activeElement));
    expect(state.anchorDate()?.toString()).toBe("2026-01-10");
    expect(onValueChange).not.toHaveBeenCalled();
    dispose();
  });

  it("leaves a calendar with no range in progress alone", async () => {
    const onValueChange = vi.fn();
    const { container, state, dispose } = await mountCalendar({
      selectionMode: "single",
      onValueChange,
    });
    dayButton(container, "2026-01-10").focus();
    await userEvent.keyboard("{Enter}");
    await vi.waitFor(() => expect(onValueChange).toHaveBeenCalledTimes(1));

    testId(container, "outside").focus();
    await userEvent.click(testId(container, "outside-inert"));

    expect(state.selectionValue()?.toString()).toBe("2026-01-10");
    expect(onValueChange).toHaveBeenCalledTimes(1);
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    const { container, dispose } = await mountCalendar();
    await expectNoA11yViolations(container);
    dispose();
  });
});
