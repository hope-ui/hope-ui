import { I18nProvider } from "@hope-ui/primitives/i18n";
import { CalendarDate } from "@internationalized/date";
import { renderToStringAsync } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import { Calendar } from "../calendar";

/**
 * Structurally identical to `calendar.browser.test.tsx`'s `FullCalendar`, which hydrates the fixture
 * this file produces. Keep them in step: hydration keys are allocated by walking the tree, so a change
 * to the component structure here fails the fixture assertion, and the same change there fails
 * hydration.
 *
 * Deterministic-by-construction for a byte-stable fixture:
 * - `locale="en-US"` via `I18nProvider` — pins month/weekday names on both server and client (no
 *   dependence on the runner's browser locale).
 * - `timeZone="UTC"` — pins date formatting.
 * - `defaultFocusedValue` in **January 2020** — a month that can never be "today", so `data-today`
 *   never appears and the seed doesn't fall back to the (non-deterministic) system clock.
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

describe("Calendar SSR", () => {
  it("resolves renderToStringAsync without throwing", async () => {
    const html = await renderToStringAsync(() => <FullCalendar />);
    expect(typeof html).toBe("string");
  });

  it("renders the group, heading, weekday headers and day cells", async () => {
    const html = await renderToStringAsync(() => <FullCalendar />);
    expect(html).toContain('role="group"');
    expect(html).toContain('role="grid"');
    expect(html).toContain("January 2020");
    // Weekday column headers (short names, full name in aria-label).
    expect(html).toContain('scope="col"');
    expect(html).toContain('aria-label="Sunday"');
    // A day cell with its full localized aria-label.
    expect(html).toContain("Wednesday, January 1, 2020");
  });

  it("gives the focused date the roving tab stop in the server markup", async () => {
    const html = await renderToStringAsync(() => <FullCalendar />);
    // The focused cell (Jan 15) is tabbable; the SSR markup carries a valid grid without JS.
    expect(html).toMatch(/tabindex="0"/);
    expect(html).toContain("data-focused");
  });

  it("matches the committed SSR fixture byte for byte", async () => {
    // `toMatchFileSnapshot` generates the fixture from a real server render (nobody guesses an `_hk`
    // key). It writes on first run, fails on drift, and under CI fails rather than writing. Update it
    // deliberately with `pnpm exec vitest run --project=ssr -u`. Byte-for-byte because `hydrate()`
    // matches on the `_hk` attribute, so "contains the right text" is not enough.
    const html = await renderToStringAsync(() => <FullCalendar />);
    await expect(html).toMatchFileSnapshot("./__fixtures__/calendar-ssr.html");
  });
});
