import ssrFixture from "virtual:hydration-fixture?id=calendar";
import detectedLocaleFixture from "virtual:hydration-fixture?id=calendar-detected-locale";
import noProviderFixture from "virtual:hydration-fixture?id=calendar-no-provider";
import { I18nProvider } from "@hope-ui/i18n";
import { expectNoA11yViolations, hydrateFixture, mount } from "@hope-ui/internal-test-utils";
import { hope } from "@hope-ui/presets/hope";
import { definePreset, ThemeProvider } from "@hope-ui/theming";
import { CalendarDate } from "@internationalized/date";
import type { JSX } from "@solidjs/web";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { Calendar, type CalendarRootProps } from "../index";
// `Tree` is the single source of truth for the calendar round-trip render: `calendar.ssr.test.tsx`
// inline-snapshots it and the hydration-fixture bridge renders it fresh into this project (no
// committed `.html`). It doubles as the plain full-calendar the interaction tests below mount, so
// there is no second hand-kept-identical copy to drift. The two `*LocaleTree`s are the same tree with
// only the locale plumbing varied — see "Calendar locale hydration" at the bottom of this file.
import { Tree } from "./calendar.ssr-entry";
import { Tree as DetectedLocaleTree } from "./calendar-detected-locale.ssr-entry";
import { Tree as NoProviderTree } from "./calendar-no-provider.ssr-entry";

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

  it("commits a range abandoned mid-selection once focus leaves the calendar", async () => {
    // End-to-end proof that `Calendar.Root` wires `createCalendarGroup`: the policy itself is
    // exercised in the primitive's own browser test, this is the assembly.
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
          <button type="button" data-testid="outside">
            Outside
          </button>
        </I18nProvider>
      </ThemeProvider>
    ));

    const anchor = dayButton(container, "Friday, January 10, 2020");
    anchor.focus();
    anchor.click();
    await vi.waitFor(() =>
      expect(container.querySelector('td[aria-selected="true"]')).not.toBeNull(),
    );
    expect(value).toBeNull(); // anchored, nothing committed yet

    (container.querySelector('[data-testid="outside"]') as HTMLElement).focus();

    await vi.waitFor(() =>
      expect((value as { start: CalendarDate } | null)?.start.toString()).toBe("2020-01-10"),
    );
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

  it("hides the weekday header row from assistive technology", async () => {
    // Each day button's accessible name already leads with its weekday, so an exposed column header
    // makes a screen reader read it twice (React Aria's `headerProps`).
    const { container, dispose } = mount(() => <Tree />);
    expect(container.querySelector("thead")?.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelector('th[scope="col"][aria-label="Sunday"]')).not.toBeNull();
    expect(dayButton(container, "Wednesday, January 15, 2020")).not.toBeNull();
    await expectNoA11yViolations(container);
    dispose();
  });

  it("renders a disabled calendar inert, down to the nav buttons", async () => {
    let value: CalendarDate | undefined;
    const { container, dispose } = mount(() => (
      <ThemeProvider preset={hope}>
        <I18nProvider locale="en-US">
          <Calendar.Root
            disabled
            defaultFocusedValue={new CalendarDate(2020, 1, 15)}
            timeZone="UTC"
            onValueChange={(v) => (value = v as CalendarDate)}
          />
        </I18nProvider>
      </ThemeProvider>
    ));

    const grid = container.querySelector('[role="grid"]') as HTMLElement;
    expect(grid.getAttribute("aria-disabled")).toBe("true");
    expect((chromeButton(container, "Previous") as HTMLButtonElement).disabled).toBe(true);
    expect((chromeButton(container, "Next") as HTMLButtonElement).disabled).toBe(true);

    const day = dayButton(container, "Friday, January 10, 2020");
    expect(day.getAttribute("aria-disabled")).toBe("true");
    expect(day.getAttribute("tabindex")).toBe("-1");
    day.click();
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(value).toBeUndefined();
    expect(heading(container).textContent).toBe("January 2020"); // nav did nothing either

    await expectNoA11yViolations(container);
    dispose();
  });

  it("renders a read-only calendar navigable but not selectable", async () => {
    let value: CalendarDate | undefined;
    const { container, dispose } = mount(() => (
      <ThemeProvider preset={hope}>
        <I18nProvider locale="en-US">
          <Calendar.Root
            readOnly
            defaultFocusedValue={new CalendarDate(2020, 1, 15)}
            timeZone="UTC"
            onValueChange={(v) => (value = v as CalendarDate)}
          />
        </I18nProvider>
      </ThemeProvider>
    ));

    const grid = container.querySelector('[role="grid"]') as HTMLElement;
    expect(grid.getAttribute("aria-readonly")).toBe("true");
    expect(grid.getAttribute("aria-disabled")).toBeNull();

    // Days stay reachable and undimmed…
    const day = dayButton(container, "Friday, January 10, 2020");
    expect(day.getAttribute("aria-disabled")).toBeNull();
    day.click();
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(value).toBeUndefined(); // …but nothing commits

    // …and paging still works.
    chromeButton(container, "Next").click();
    await vi.waitFor(() => expect(heading(container).textContent).toBe("February 2020"));

    await expectNoA11yViolations(container);
    dispose();
  });

  it("marks a range grid multiselectable", () => {
    const { container, dispose } = mount(() => (
      <ThemeProvider preset={hope}>
        <I18nProvider locale="en-US">
          <Calendar.Root
            selectionMode="range"
            defaultFocusedValue={new CalendarDate(2020, 1, 15)}
            timeZone="UTC"
          />
        </I18nProvider>
      </ThemeProvider>
    ));
    const grid = container.querySelector('[role="grid"]') as HTMLElement;
    expect(grid.getAttribute("aria-multiselectable")).toBe("true");
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    const { container, dispose } = mount(() => <Tree />);
    expect(heading(container).textContent).toBe("January 2020");
    await expectNoA11yViolations(container);
    dispose();
  });

  it("emits an explicit dir prop onto the group element, not only as primitive config", async () => {
    // `dir` is the one `createCalendar` option that is also a real HTML attribute. The primitive reads
    // it to pick the arrow-key mapping; if it stopped there, the grid would still lay out
    // left-to-right — Sunday on the left — while the arrows moved right-to-left. Same contract as
    // `Listbox.Root`: the prop is a per-instance instruction, so it reaches the element. A
    // locale-derived direction never does — see `createTextDirectionWarning`.
    const { container, dispose } = mount(() => (
      <ThemeProvider preset={hope}>
        <I18nProvider locale="en-US">
          <Calendar.Root
            dir="rtl"
            defaultFocusedValue={new CalendarDate(2020, 1, 15)}
            timeZone="UTC"
          />
        </I18nProvider>
      </ThemeProvider>
    ));
    await vi.waitFor(() => expect(heading(container).textContent).toBe("January 2020"));

    const group = container.querySelector<HTMLElement>('[data-slot="calendar"]') as HTMLElement;
    expect(group.getAttribute("dir")).toBe("rtl");
    expect(window.getComputedStyle(group).direction).toBe("rtl");

    await expectNoA11yViolations(container);
    dispose();
  });

  it("mirrors from an ancestor's dir, which it does not itself write", async () => {
    // The app declares direction where the browser can see it; hope-ui reads it from there. Same line
    // Base UI and React Aria draw — React Aria's `useCalendarGrid` puts no `dir` in `gridProps` at
    // all, and a locale-derived `dir` would override this ancestor.
    const { container, dispose } = mount(() => (
      <div dir="rtl">
        <ThemeProvider preset={hope}>
          <I18nProvider locale="ar-EG">
            <Calendar.Root defaultFocusedValue={new CalendarDate(2020, 1, 15)} timeZone="UTC" />
          </I18nProvider>
        </ThemeProvider>
      </div>
    ));

    const group = await vi.waitFor(() => {
      const found = container.querySelector<HTMLElement>('[data-slot="calendar"]');
      expect(found?.querySelectorAll("th").length).toBeGreaterThan(0);
      return found as HTMLElement;
    });

    expect(group.hasAttribute("dir")).toBe(false);
    expect(window.getComputedStyle(group).direction).toBe("rtl"); // inherited, not written

    // And the layout actually mirrors: the first weekday column sits on the right.
    const headers = [...group.querySelectorAll("th")];
    const first = headers.at(0) as HTMLTableCellElement;
    const last = headers.at(-1) as HTMLTableCellElement;
    expect(first.getBoundingClientRect().x).toBeGreaterThan(last.getBoundingClientRect().x);

    dispose();
  });

  it("warns in dev when the grid's keymap and layout disagree", async () => {
    // A calendar grid is 2D, so Left/Right always matter — this always warns, unlike a vertical
    // listbox. The split is real and both references accept it, so make it loud instead of silent:
    // `<I18nProvider locale="ar-EG">` with no `dir` anywhere gives Arabic-Indic numerals and reversed
    // arrows over a grid still laid out left-to-right.
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { container, dispose } = mount(() => (
      <ThemeProvider preset={hope}>
        <I18nProvider locale="ar-EG">
          <Calendar.Root defaultFocusedValue={new CalendarDate(2020, 1, 15)} timeZone="UTC" />
        </I18nProvider>
      </ThemeProvider>
    ));
    await vi.waitFor(() => expect(container.querySelectorAll("th").length).toBeGreaterThan(0));

    await vi.waitFor(() =>
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("[hope-ui] Calendar")),
    );
    expect(warn.mock.calls.flat().join(" ")).toContain("document.documentElement.dir");

    warn.mockRestore();
    dispose();
  });

  it("stays quiet once the app declares the direction the locale implies", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { container, dispose } = mount(() => (
      <div dir="rtl">
        <ThemeProvider preset={hope}>
          <I18nProvider locale="ar-EG">
            <Calendar.Root defaultFocusedValue={new CalendarDate(2020, 1, 15)} timeZone="UTC" />
          </I18nProvider>
        </ThemeProvider>
      </div>
    ));
    await vi.waitFor(() => expect(container.querySelectorAll("th").length).toBeGreaterThan(0));

    expect(warn.mock.calls.flat().join(" ")).not.toContain("[hope-ui] Calendar");

    warn.mockRestore();
    dispose();
  });

  it("stays quiet when a dir prop supplies the direction, since it reaches the DOM", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { container, dispose } = mount(() => (
      <ThemeProvider preset={hope}>
        <I18nProvider locale="en-US">
          <Calendar.Root
            dir="rtl"
            defaultFocusedValue={new CalendarDate(2020, 1, 15)}
            timeZone="UTC"
          />
        </I18nProvider>
      </ThemeProvider>
    ));
    await vi.waitFor(() => expect(container.querySelectorAll("th").length).toBeGreaterThan(0));

    expect(warn.mock.calls.flat().join(" ")).not.toContain("[hope-ui] Calendar");

    warn.mockRestore();
    dispose();
  });
});

describe("Calendar native attributes", () => {
  // `Calendar.Root` forwards the native `<div>` attributes it doesn't consume itself onto the group
  // element, through `createCalendarGroup` (which owns the precedence). Before it did, there was no
  // way to give the container an `id`, a `style`, a `data-*` hook or a second event handler — a gap
  // the docs already promised was closed, and one no other Calendar part had.
  // The spread is typed as `CalendarRootProps`, which pins the passthrough at the type level too:
  // before the fix these were not assignable to the prop surface at all. (`data-*` is exempt from
  // that check in JSX position — TS lets any hyphenated attribute through — so the tests below assert
  // it reaches the DOM rather than relying on the type.)
  const nativeProps: CalendarRootProps = {
    id: "birthday-calendar",
    style: { "max-width": "480px" },
    "aria-describedby": "hint",
  };

  it("forwards unconsumed native attributes to the group element", async () => {
    const { container, dispose } = mount(() => (
      <ThemeProvider preset={hope}>
        <I18nProvider locale="en-US">
          <Calendar.Root
            defaultFocusedValue={new CalendarDate(2020, 1, 15)}
            timeZone="UTC"
            data-testid="calendar"
            {...nativeProps}
          />
        </I18nProvider>
      </ThemeProvider>
    ));
    await vi.waitFor(() => expect(heading(container).textContent).toBe("January 2020"));

    const group = container.querySelector<HTMLElement>('[data-slot="calendar"]') as HTMLElement;
    expect(group.id).toBe("birthday-calendar");
    expect(group.getAttribute("data-testid")).toBe("calendar");
    expect(group.style.maxWidth).toBe("480px");
    expect(group.getAttribute("aria-describedby")).toBe("hint");
    // The recipe's own class survives the merge rather than being replaced by the passthrough.
    expect(group.className).toContain("inline-flex");
    dispose();
  });

  it("does not leak createCalendar options onto the element as attributes", async () => {
    // The cost of forwarding: the `omit` list in `Root` is what separates "a native attribute the
    // consumer wants on the element" from "an option the primitive consumes", and it is hand-kept.
    // A key missing from it lands in the DOM as a junk attribute — invisible, since nothing else
    // fails. Options with a string value are the ones that would actually show up.
    const { container, dispose } = mount(() => (
      <ThemeProvider preset={hope}>
        <I18nProvider locale="en-US">
          <Calendar.Root
            defaultFocusedValue={new CalendarDate(2020, 1, 15)}
            timeZone="UTC"
            locale="en-US"
            label="Departure date"
            selectionMode="range"
            commitBehavior="reset"
            size="lg"
          />
        </I18nProvider>
      </ThemeProvider>
    ));
    await vi.waitFor(() => expect(heading(container).textContent).toBe("January 2020"));

    const group = container.querySelector<HTMLElement>('[data-slot="calendar"]') as HTMLElement;
    for (const option of [
      "timezone",
      "locale",
      "label",
      "selectionmode",
      "commitbehavior",
      "size",
    ]) {
      expect(group.hasAttribute(option), `${option} leaked onto the group element`).toBe(false);
    }
    // `label` reaches the DOM only as the accessible name it is.
    expect(group.getAttribute("aria-label")).toBe("Departure date");
    dispose();
  });

  it("keeps the primitive's own attributes winning over a consumer's", async () => {
    const { container, dispose } = mount(() => (
      <ThemeProvider preset={hope}>
        <I18nProvider locale="en-US">
          <Calendar.Root
            defaultFocusedValue={new CalendarDate(2020, 1, 15)}
            timeZone="UTC"
            role="region"
            data-slot="nope"
          />
        </I18nProvider>
      </ThemeProvider>
    ));
    await vi.waitFor(() => expect(heading(container).textContent).toBe("January 2020"));

    const group = container.querySelector<HTMLElement>('[data-slot="calendar"]') as HTMLElement;
    expect(group.getAttribute("role")).toBe("group");
    expect(group.getAttribute("data-slot")).toBe("calendar");
    dispose();
  });

  it("lets a consumer aria-label name the group, like the label option does", async () => {
    const { container, dispose } = mount(() => (
      <ThemeProvider preset={hope}>
        <I18nProvider locale="en-US">
          <Calendar.Root
            defaultFocusedValue={new CalendarDate(2020, 1, 15)}
            timeZone="UTC"
            aria-label="Departure date"
          />
        </I18nProvider>
      </ThemeProvider>
    ));
    await vi.waitFor(() => expect(heading(container).textContent).toBe("January 2020"));

    // The part hook defers here (`props["aria-label"] ?? state.groupLabel()`) — the one attribute it
    // deliberately does not win. Unreachable until `Root` forwarded anything at all.
    const group = container.querySelector<HTMLElement>('[data-slot="calendar"]') as HTMLElement;
    expect(group.getAttribute("aria-label")).toBe("Departure date");

    await expectNoA11yViolations(container);
    dispose();
  });

  it("merges a consumer ref with the primitive's own, keeping the abandonment policy wired", async () => {
    // `renderElement` collapses the consumer `ref` and `group.setRef` into one function ref. If the
    // passthrough had shadowed the internal one, the range below would never commit — that is what
    // proves both halves ran, not just that the consumer's fired.
    let consumerRef: HTMLElement | undefined;
    let value: unknown = null;
    const { container, dispose } = mount(() => (
      <ThemeProvider preset={hope}>
        <I18nProvider locale="en-US">
          <Calendar.Root
            selectionMode="range"
            defaultFocusedValue={new CalendarDate(2020, 1, 15)}
            timeZone="UTC"
            ref={(element: HTMLElement) => {
              consumerRef = element;
            }}
            onValueChange={(v) => {
              value = v;
            }}
          >
            <Calendar.Grid />
          </Calendar.Root>
          <button type="button" data-testid="outside">
            Outside
          </button>
        </I18nProvider>
      </ThemeProvider>
    ));

    expect(consumerRef).toBe(container.querySelector('[data-slot="calendar"]'));

    const anchor = dayButton(container, "Friday, January 10, 2020");
    anchor.focus();
    anchor.click();
    await vi.waitFor(() =>
      expect(container.querySelector('td[aria-selected="true"]')).not.toBeNull(),
    );
    (container.querySelector('[data-testid="outside"]') as HTMLElement).focus();
    await vi.waitFor(() =>
      expect((value as { start: CalendarDate } | null)?.start.toString()).toBe("2020-01-10"),
    );
    dispose();
  });

  it("composes a consumer onFocusOut with the abandonment policy, rather than replacing it", async () => {
    // The other attribute the part hook does not simply win: `composeEventHandlers` runs the
    // consumer's first, then the policy's. Both must observe the same focus-out.
    let sawFocusOut = false;
    let value: unknown = null;
    const { container, dispose } = mount(() => (
      <ThemeProvider preset={hope}>
        <I18nProvider locale="en-US">
          <Calendar.Root
            selectionMode="range"
            defaultFocusedValue={new CalendarDate(2020, 1, 15)}
            timeZone="UTC"
            onFocusOut={() => {
              sawFocusOut = true;
            }}
            onValueChange={(v) => {
              value = v;
            }}
          >
            <Calendar.Grid />
          </Calendar.Root>
          <button type="button" data-testid="outside">
            Outside
          </button>
        </I18nProvider>
      </ThemeProvider>
    ));

    const anchor = dayButton(container, "Friday, January 10, 2020");
    anchor.focus();
    anchor.click();
    await vi.waitFor(() =>
      expect(container.querySelector('td[aria-selected="true"]')).not.toBeNull(),
    );
    (container.querySelector('[data-testid="outside"]') as HTMLElement).focus();

    await vi.waitFor(() => expect(sawFocusOut).toBe(true));
    await vi.waitFor(() =>
      expect((value as { start: CalendarDate } | null)?.start.toString()).toBe("2020-01-10"),
    );
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

  it("moves the single selection off the server-painted defaultValue on the first click", async () => {
    // `Tree` ships `defaultValue` Jan 10, so the *server* HTML already carries `data-selected` +
    // `aria-selected` on that day. Selecting another day in single mode must move the paint, not add a
    // second one: a hydrated attribute the client never re-derives would leave Jan 10 lit alongside
    // Jan 20 — visually two selected days for one selection.
    const { container, dispose } = hydrateFixture(ssrFixture, () => <Tree />);

    expect(dayButton(container, "Friday, January 10, 2020").hasAttribute("data-selected")).toBe(
      true,
    );

    dayButton(container, "Monday, January 20, 2020").click();
    await vi.waitFor(() =>
      expect(dayButton(container, "Monday, January 20, 2020").hasAttribute("data-selected")).toBe(
        true,
      ),
    );

    const painted = [...container.querySelectorAll("button[data-selected]")].map((button) =>
      button.getAttribute("aria-label"),
    );
    expect(painted).toEqual(["Monday, January 20, 2020, selected"]);

    const announced = [...container.querySelectorAll('td[aria-selected="true"]')].map((cell) =>
      cell.querySelector("button")?.getAttribute("aria-label"),
    );
    expect(announced).toEqual(["Monday, January 20, 2020, selected"]);

    dispose();
  });
});

describe("Calendar locale hydration", () => {
  // The round-trip above pins `locale="en-US"` on both halves, so it never exercises the case a real
  // deployment hits constantly: a prerendered page (no `navigator` → `en-US`) opened by a visitor whose
  // browser is something else. A Monday-first locale shifts the whole month grid by a day — and January
  // 2020 spans 35 cells under *either* first-day-of-week, so a client that rendered its own locale
  // during hydration would reuse every node, warn about nothing, and leave the markup silently
  // disagreeing with the model about what each cell is. It regressed exactly that way once: clicking
  // "20" selected the 21st and `defaultValue`'s cell stayed painted beside it.
  //
  // `readDetectedLocale`'s hydration gate is what prevents it. Both entries render the same calendar
  // and differ only in locale plumbing — zero-config vs a provider with no `locale` prop — so the pair
  // proves the gate covers both, rather than proving something about the calendar.
  const withBrowserLocale = async (locale: string, body: () => Promise<void>) => {
    const languageDescriptor = Object.getOwnPropertyDescriptor(
      Navigator.prototype,
      "language",
    ) as PropertyDescriptor;
    Object.defineProperty(navigator, "language", { value: locale, configurable: true });
    // The detected locale is read once into a `Symbol.for` registry, so the stub only takes effect
    // once that slot is cleared — and the slot must be cleared again afterwards, since it now holds a
    // signal seeded from the stubbed value.
    const registryKey = Symbol.for("@hope-ui/i18n:locale-registry");
    const globalScope = globalThis as Record<symbol, unknown>;
    delete globalScope[registryKey];

    try {
      await body();
    } finally {
      Object.defineProperty(navigator, "language", languageDescriptor);
      delete globalScope[registryKey];
    }
  };

  const painted = (container: HTMLElement) => [
    ...container.querySelectorAll("button[data-selected]"),
  ];

  // Hydration adopts the visitor's locale by *replacing* every locale-derived node, so the strict
  // node-identity assertion can't apply; console silence and element count still do, and they are what
  // separates this deliberate re-render from a silent client-render fallback.
  const expectLocalizedRoundTrip = async (
    serverHtml: string,
    ui: () => JSX.Element,
  ): Promise<void> => {
    const { container, dispose } = hydrateFixture(serverHtml, ui, { expectNodeReuse: false });
    try {
      // The gate opens on the first microtask after the hydration pass ends, so the localized
      // re-render lands a tick later — still before paint, but not synchronously with `hydrate()`.
      // The server's `en-US` markup (Sunday-first, English) becomes Monday-first and French, with
      // markup and model agreeing.
      await vi.waitFor(() =>
        expect(container.querySelector("thead")?.textContent).toBe("lun.mar.mer.jeu.ven.sam.dim."),
      );
      expect(heading(container).textContent).toBe("janvier 2020");
      expect(painted(container).map((day) => day.getAttribute("aria-label"))).toEqual([
        "vendredi 10 janvier 2020, sélectionné",
      ]);

      // And selecting moves the paint to exactly the day that was clicked — no ghost left behind,
      // which is the regression this pair exists to catch.
      const clicked = dayButton(container, "lundi 20 janvier 2020");
      clicked.click();
      await vi.waitFor(() => expect(clicked.hasAttribute("data-selected")).toBe(true));
      expect(painted(container)).toEqual([clicked]);
    } finally {
      dispose();
    }
  };

  it("localizes the whole grid through hydration with no I18nProvider mounted", async () => {
    await withBrowserLocale("fr-FR", () =>
      expectLocalizedRoundTrip(noProviderFixture, () => <NoProviderTree />),
    );
  });

  it("localizes the whole grid through hydration with an I18nProvider and no locale prop", async () => {
    await withBrowserLocale("fr-FR", () =>
      expectLocalizedRoundTrip(detectedLocaleFixture, () => <DetectedLocaleTree />),
    );
  });
});
