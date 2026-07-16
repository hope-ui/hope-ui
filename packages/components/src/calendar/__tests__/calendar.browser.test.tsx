import { expectNoA11yViolations, hydrateFixture, mount } from "@hope-ui/internal-test-utils";
import { I18nProvider } from "@hope-ui/primitives/i18n";
import { CalendarDate } from "@internationalized/date";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { Calendar } from "../calendar";
import ssrFixture from "./__fixtures__/calendar-ssr.html?raw";

/**
 * Structurally identical to `calendar.ssr.test.tsx`'s `FullCalendar`, which produces the fixture the
 * hydration tests below consume. Hydration keys are allocated by walking the tree, so any structural
 * change here must be mirrored there (and the fixture regenerated) or hydration fails.
 */
function FullCalendar() {
  return (
    <I18nProvider locale="en-US">
      <Calendar.Root defaultFocusedValue={new CalendarDate(2020, 1, 15)} timeZone="UTC">
        <Calendar.Header>
          <Calendar.PrevButton aria-label="Previous month">‹</Calendar.PrevButton>
          <Calendar.Heading />
          <Calendar.NextButton aria-label="Next month">›</Calendar.NextButton>
        </Calendar.Header>
        <Calendar.Grid />
      </Calendar.Root>
    </I18nProvider>
  );
}

// Queries are scoped to the mount's own container (the calendar renders 35+ buttons, so a
// document-wide `page.getByRole` with its default substring name-match is hopelessly ambiguous).
const dayButton = (root: ParentNode, labelPrefix: string) =>
  root.querySelector<HTMLElement>(`button[aria-label^="${labelPrefix}"]`) as HTMLElement;
const heading = (root: ParentNode) => root.querySelector<HTMLElement>("button[id]") as HTMLElement;
const chromeButton = (root: ParentNode, label: string) =>
  root.querySelector<HTMLElement>(`button[aria-label="${label}"]`) as HTMLElement;

describe("Calendar", () => {
  it("renders the month grid with the heading label and weekday headers", async () => {
    const { container, dispose } = mount(() => <FullCalendar />);
    expect(heading(container).textContent).toBe("January 2020");
    expect(container.querySelector('th[scope="col"][aria-label="Sunday"]')).not.toBeNull();
    expect(dayButton(container, "Wednesday, January 15, 2020")).not.toBeNull();
    dispose();
  });

  it("roves focus with the arrow keys", async () => {
    const { container, dispose } = mount(() => <FullCalendar />);
    dayButton(container, "Wednesday, January 15, 2020").focus();
    await expect.element(dayButton(container, "Wednesday, January 15, 2020")).toHaveFocus();

    await userEvent.keyboard("{ArrowRight}");
    await expect.element(dayButton(container, "Thursday, January 16, 2020")).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect.element(dayButton(container, "Thursday, January 23, 2020")).toHaveFocus();
    dispose();
  });

  it("selects a day on click and calls onValueChange", async () => {
    let value: CalendarDate | undefined;
    const { container, dispose } = mount(() => (
      <I18nProvider locale="en-US">
        <Calendar.Root
          defaultFocusedValue={new CalendarDate(2020, 1, 15)}
          timeZone="UTC"
          onValueChange={(v) => (value = v as CalendarDate)}
        >
          <Calendar.Grid />
        </Calendar.Root>
      </I18nProvider>
    ));

    dayButton(container, "Friday, January 10, 2020").click();
    await vi.waitFor(() => expect(value?.toString()).toBe("2020-01-10"));
    // The selected cell reflects it in the accessibility tree.
    const selectedCell = container.querySelector('td[aria-selected="true"]') as HTMLElement;
    expect(selectedCell.querySelector("button")?.getAttribute("aria-label")).toContain(
      "January 10, 2020",
    );
    dispose();
  });

  it("pages months with the next/prev buttons", async () => {
    const { container, dispose } = mount(() => <FullCalendar />);
    chromeButton(container, "Next month").click();
    await vi.waitFor(() => expect(heading(container).textContent).toBe("February 2020"));
    chromeButton(container, "Previous month").click();
    await vi.waitFor(() => expect(heading(container).textContent).toBe("January 2020"));
    dispose();
  });

  it("drills up to the year view when the heading is clicked", async () => {
    const { container, dispose } = mount(() => <FullCalendar />);
    heading(container).click();
    // Year view: the heading shows the year and the grid shows month cells.
    await vi.waitFor(() => expect(heading(container).textContent).toBe("2020"));
    expect(dayButton(container, "June 2020")).not.toBeNull();
    dispose();
  });

  it("selects a range across two clicks", async () => {
    type Range = { start: CalendarDate; end: CalendarDate };
    let value: unknown = null;
    const { container, dispose } = mount(() => (
      <I18nProvider locale="en-US">
        <Calendar.Root
          selectionMode="range"
          defaultFocusedValue={new CalendarDate(2020, 1, 15)}
          timeZone="UTC"
          onValueChange={(v) => {
            value = v;
          }}
        >
          <Calendar.Grid />
        </Calendar.Root>
      </I18nProvider>
    ));

    dayButton(container, "Friday, January 10, 2020").click(); // anchor
    // Wait for the anchor to commit (the client build defers the write) before the second click, so
    // the completing activate reads the anchor rather than starting a fresh range.
    await vi.waitFor(() =>
      expect(container.querySelector('td[aria-selected="true"]')).not.toBeNull(),
    );
    expect(value).toBeNull(); // anchored, not yet committed
    dayButton(container, "Wednesday, January 15, 2020").click(); // complete
    await vi.waitFor(() => expect((value as Range | null)?.start.toString()).toBe("2020-01-10"));
    expect((value as Range).end.toString()).toBe("2020-01-15");
    dispose();
  });

  it("supports controlled value", async () => {
    const [value, setValue] = createSignal<CalendarDate | null>(null);
    const { container, dispose } = mount(() => (
      <I18nProvider locale="en-US">
        <Calendar.Root
          value={value()}
          onValueChange={(v) => setValue(v as CalendarDate)}
          defaultFocusedValue={new CalendarDate(2020, 1, 15)}
          timeZone="UTC"
        >
          <Calendar.Grid />
        </Calendar.Root>
      </I18nProvider>
    ));

    setValue(new CalendarDate(2020, 1, 20));
    await vi.waitFor(() => {
      const cell = container.querySelector('td[aria-selected="true"]') as HTMLElement | null;
      expect(cell?.querySelector("button")?.getAttribute("aria-label")).toContain(
        "January 20, 2020",
      );
    });
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    const { container, dispose } = mount(() => <FullCalendar />);
    expect(heading(container).textContent).toBe("January 2020");
    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("Calendar hydration", () => {
  // `ssrFixture` is genuine server output (`calendar.ssr.test.tsx` asserts it byte-for-byte).
  // `FullCalendar` must stay structurally identical to the ssr test's — hydration keys are a path
  // through the tree. `hydrateFixture` proves hydration was silent and reused *every* server node
  // (the whole grid), not just the `<table>`.
  it("hydrates the server HTML in place, without a mismatch or a second render", () => {
    const { dispose } = hydrateFixture(ssrFixture, () => <FullCalendar />);
    dispose();
  });

  it("is interactive after hydrating", async () => {
    const { container, dispose } = hydrateFixture(ssrFixture, () => <FullCalendar />);

    const headingButton = container.querySelector<HTMLElement>("button[id]") as HTMLElement;
    (
      container.querySelector<HTMLElement>('button[aria-label="Next month"]') as HTMLElement
    ).click();
    await vi.waitFor(() => expect(headingButton.textContent).toBe("February 2020"));

    dispose();
  });

  it("has no accessibility violations after hydrating", async () => {
    const { container, dispose } = hydrateFixture(ssrFixture, () => <FullCalendar />);

    await expectNoA11yViolations(container);
    dispose();
  });
});
