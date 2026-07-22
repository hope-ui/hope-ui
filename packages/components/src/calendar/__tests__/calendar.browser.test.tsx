import ssrFixture from "virtual:hydration-fixture?id=calendar";
import { I18nProvider } from "@hope-ui/i18n";
import { expectNoA11yViolations, hydrateFixture, mount } from "@hope-ui/internal-test-utils";
import { hope } from "@hope-ui/presets/hope";
import { definePreset, ThemeProvider } from "@hope-ui/theming";
import { CalendarDate } from "@internationalized/date";
import type { JSX } from "@solidjs/web";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { Calendar } from "../index";
// `Tree` is the single source of truth for the calendar round-trip render: `calendar.ssr.test.tsx`
// inline-snapshots it and the hydration-fixture bridge renders it fresh into this project (no
// committed `.html`). It doubles as the plain full-calendar the interaction tests below mount, so
// there is no second hand-kept-identical copy to drift.
import { Tree } from "./calendar.ssr-entry";

// Queries are scoped to the mount's own container (the calendar renders 35+ buttons, so a
// document-wide `page.getByRole` with its default substring name-match is hopelessly ambiguous).
const dayButton = (root: ParentNode, labelPrefix: string) =>
  root.querySelector<HTMLElement>(`button[aria-label^="${labelPrefix}"]`) as HTMLElement;
const heading = (root: ParentNode) => root.querySelector<HTMLElement>("button[id]") as HTMLElement;
const chromeButton = (root: ParentNode, label: string) =>
  root.querySelector<HTMLElement>(`button[aria-label="${label}"]`) as HTMLElement;

// A recognizable custom nav glyph for the override tests, tagged so it's distinguishable from hope's
// built-in chevron and from its sibling (`mark` = "prev"/"next").
function CustomIcon(props: { mark: string }): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" data-custom-icon={props.mark}>
      <path d="M4 4h16v16H4z" />
    </svg>
  );
}

describe("Calendar", () => {
  it("renders the month grid with the heading label and weekday headers", async () => {
    const { container, dispose } = mount(() => <Tree />);
    expect(heading(container).textContent).toBe("January 2020");
    expect(container.querySelector('th[scope="col"][aria-label="Sunday"]')).not.toBeNull();
    expect(dayButton(container, "Wednesday, January 15, 2020")).not.toBeNull();
    dispose();
  });

  it("auto-renders the default chrome and grid when given no children", async () => {
    // The Phase-4 convenience API: a bare `<Calendar.Root/>` with no compound parts. Root's internal
    // `DefaultCalendar` supplies the whole anatomy (header + chevron nav + heading, then the grid).
    const { container, dispose } = mount(() => (
      <ThemeProvider preset={hope}>
        <I18nProvider locale="en-US">
          <Calendar.Root defaultFocusedValue={new CalendarDate(2020, 1, 15)} timeZone="UTC" />
        </I18nProvider>
      </ThemeProvider>
    ));

    // Heading label, weekday head and day buttons all render with no explicit children.
    expect(heading(container).textContent).toBe("January 2020");
    expect(container.querySelector('th[scope="col"][aria-label="Sunday"]')).not.toBeNull();
    expect(dayButton(container, "Wednesday, January 15, 2020")).not.toBeNull();

    // The built-in nav buttons carry the localized default aria-labels + an inline chevron glyph.
    const prev = chromeButton(container, "Previous");
    const next = chromeButton(container, "Next");
    expect(prev.querySelector("svg")).not.toBeNull();
    expect(next.querySelector("svg")).not.toBeNull();

    // Nav works: paging forward advances the month, back returns.
    next.click();
    await vi.waitFor(() => expect(heading(container).textContent).toBe("February 2020"));
    prev.click();
    await vi.waitFor(() => expect(heading(container).textContent).toBe("January 2020"));

    // The auto-composed default chrome is accessible out of the box.
    await expectNoA11yViolations(container);
    dispose();
  });

  it("roves focus with the arrow keys", async () => {
    const { container, dispose } = mount(() => <Tree />);
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
      <ThemeProvider preset={hope}>
        <I18nProvider locale="en-US">
          <Calendar.Root
            defaultFocusedValue={new CalendarDate(2020, 1, 15)}
            timeZone="UTC"
            onValueChange={(v) => (value = v as CalendarDate)}
          >
            <Calendar.Grid />
          </Calendar.Root>
        </I18nProvider>
      </ThemeProvider>
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
    const { container, dispose } = mount(() => <Tree />);
    chromeButton(container, "Next month").click();
    await vi.waitFor(() => expect(heading(container).textContent).toBe("February 2020"));
    chromeButton(container, "Previous month").click();
    await vi.waitFor(() => expect(heading(container).textContent).toBe("January 2020"));
    dispose();
  });

  it("drills up to the year view when the heading is clicked", async () => {
    const { container, dispose } = mount(() => <Tree />);
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
      <ThemeProvider preset={hope}>
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
      </ThemeProvider>
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
      <ThemeProvider preset={hope}>
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
      </ThemeProvider>
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

  it("renders a hidden native input from the selection when name is set", async () => {
    const { container, dispose } = mount(() => (
      <ThemeProvider preset={hope}>
        <I18nProvider locale="en-US">
          <Calendar.Root
            name="date"
            defaultFocusedValue={new CalendarDate(2020, 1, 15)}
            timeZone="UTC"
          >
            <Calendar.Grid />
          </Calendar.Root>
        </I18nProvider>
      </ThemeProvider>
    ));

    // Opt-in, but nothing selected yet → no hidden field.
    expect(container.querySelector('input[type="hidden"][name="date"]')).toBeNull();

    dayButton(container, "Friday, January 10, 2020").click();
    await vi.waitFor(() => {
      const input = container.querySelector<HTMLInputElement>('input[type="hidden"][name="date"]');
      expect(input?.value).toBe("2020-01-10");
    });
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    const { container, dispose } = mount(() => <Tree />);
    expect(heading(container).textContent).toBe("January 2020");
    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("Calendar navigation glyphs", () => {
  // The prev/next glyph is built into the part itself: a bare `Calendar.PrevButton`/`NextButton` (even
  // in a compound calendar, not just the auto-chrome) renders hope's chevron with no children, and it
  // is overridable per instance via `children` or app-wide via the preset's `defaultProps`.
  const bare = (): JSX.Element => (
    <ThemeProvider preset={hope}>
      <I18nProvider locale="en-US">
        <Calendar.Root defaultFocusedValue={new CalendarDate(2020, 1, 15)} timeZone="UTC">
          <Calendar.Header>
            <Calendar.PrevButton />
            <Calendar.NextButton />
          </Calendar.Header>
        </Calendar.Root>
      </I18nProvider>
    </ThemeProvider>
  );

  it("ships a built-in chevron in a bare compound PrevButton/NextButton", () => {
    const { container, dispose } = mount(() => bare());
    // No children passed, yet each nav button carries an inline glyph — the built-in default flows
    // from Root through context into the part.
    expect(chromeButton(container, "Previous").querySelector("svg")).not.toBeNull();
    expect(chromeButton(container, "Next").querySelector("svg")).not.toBeNull();
    dispose();
  });

  it("lets a per-instance child override the built-in glyph", () => {
    const { container, dispose } = mount(() => (
      <ThemeProvider preset={hope}>
        <I18nProvider locale="en-US">
          <Calendar.Root defaultFocusedValue={new CalendarDate(2020, 1, 15)} timeZone="UTC">
            <Calendar.Header>
              <Calendar.PrevButton aria-label="Previous">PREV</Calendar.PrevButton>
              <Calendar.NextButton aria-label="Next">
                <CustomIcon mark="next" />
              </Calendar.NextButton>
            </Calendar.Header>
          </Calendar.Root>
        </I18nProvider>
      </ThemeProvider>
    ));

    const prev = chromeButton(container, "Previous");
    // Text child wins — no built-in chevron.
    expect(prev.textContent).toBe("PREV");
    expect(prev.querySelector("svg")).toBeNull();
    // Custom element child wins over the built-in chevron.
    const next = chromeButton(container, "Next");
    expect(next.querySelector('svg[data-custom-icon="next"]')).not.toBeNull();
    dispose();
  });

  it("takes app-wide nav glyphs from a preset's defaultProps.calendar", () => {
    // `hope` sets no calendar defaultProps, so extend it: a preset supplies the app-wide glyphs as
    // reuse-safe factories, resolved by Root's `useDefaults` and flowed to the bare parts.
    const withNavIcons = definePreset(hope, {
      components: {
        calendar: {
          defaultProps: {
            prevIcon: () => <CustomIcon mark="prev" />,
            nextIcon: () => <CustomIcon mark="next" />,
          },
        },
      },
    });

    const { container, dispose } = mount(() => (
      <ThemeProvider preset={withNavIcons}>
        <I18nProvider locale="en-US">
          <Calendar.Root defaultFocusedValue={new CalendarDate(2020, 1, 15)} timeZone="UTC">
            <Calendar.Header>
              <Calendar.PrevButton />
              <Calendar.NextButton />
            </Calendar.Header>
          </Calendar.Root>
        </I18nProvider>
      </ThemeProvider>
    ));

    // The preset's factory glyphs, not hope's built-in chevrons.
    expect(
      chromeButton(container, "Previous").querySelector('svg[data-custom-icon="prev"]'),
    ).not.toBeNull();
    expect(
      chromeButton(container, "Next").querySelector('svg[data-custom-icon="next"]'),
    ).not.toBeNull();
    dispose();
  });
});

describe("Calendar hydration", () => {
  // `ssrFixture` is genuine server output: the hydration-fixture bridge renders `Tree` server-side
  // and `calendar.ssr.test.tsx` inline-snapshots that same render, so they agree byte-for-byte.
  // Hydrating with the shared `Tree` keeps the client structurally identical to the server (keys are
  // a path through the tree). `hydrateFixture` proves hydration was silent and reused *every* server
  // node (the whole grid), not just the `<table>`.
  it("hydrates the server HTML in place, without a mismatch or a second render", () => {
    const { dispose } = hydrateFixture(ssrFixture, () => <Tree />);
    dispose();
  });

  it("is interactive after hydrating", async () => {
    const { container, dispose } = hydrateFixture(ssrFixture, () => <Tree />);

    const headingButton = container.querySelector<HTMLElement>("button[id]") as HTMLElement;
    (
      container.querySelector<HTMLElement>('button[aria-label="Next month"]') as HTMLElement
    ).click();
    await vi.waitFor(() => expect(headingButton.textContent).toBe("February 2020"));

    dispose();
  });

  it("has no accessibility violations after hydrating", async () => {
    const { container, dispose } = hydrateFixture(ssrFixture, () => <Tree />);

    await expectNoA11yViolations(container);
    dispose();
  });
});
