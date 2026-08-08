import { I18nProvider } from "@hope-ui/i18n";
import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import { CalendarDate } from "@internationalized/date";
import type { JSX } from "@solidjs/web";
import { renderToStream } from "@solidjs/web";
import { Calendar } from "../index";

// The single source of truth for Calendar's server-render → hydration round-trip, shared by
// `calendar.ssr.test.tsx` (snapshots the bytes), `calendar.browser.test.tsx` (hydrates it and drives
// it), and the fixture bridge that renders it server-side for that browser test.
//
// Reusing one definition is what enforces "structurally identical server and client": Solid pairs
// server and client nodes by a key derived from each node's path through the component tree.
//
// Every prop below exists to make the render deterministic, so the byte-exact snapshot is stable:
// - `<ThemeProvider>` resolves the real styled markup. It renders no DOM (hope's token values live in
//   CSS) but it is a node on that key path, so it must be present identically on both sides.
// - `locale="en-US"` pins month and weekday names, instead of inheriting the runner's browser locale.
// - `timeZone="UTC"` pins date formatting.
// - a focused date in **January 2020** — a month that can never be "today", so nothing keys off the
//   system clock.
// - `defaultValue` + `name` pull a painted selection (distinct from the separately-focused day) and a
//   hidden form field into the round-trip.

export function Tree(): JSX.Element {
  return (
    <ThemeProvider preset={hope}>
      <I18nProvider locale="en-US">
        <Calendar.Root
          name="date"
          defaultValue={new CalendarDate(2020, 1, 10)}
          defaultFocusedValue={new CalendarDate(2020, 1, 15)}
          timeZone="UTC"
        >
          <Calendar.Header>
            <Calendar.PrevButton aria-label="Previous month">‹</Calendar.PrevButton>
            <Calendar.Heading />
            <Calendar.NextButton aria-label="Next month">›</Calendar.NextButton>
          </Calendar.Header>
          <Calendar.Grid />
        </Calendar.Root>
      </I18nProvider>
    </ThemeProvider>
  );
}

/** The server render the hydration-fixture bridge invokes. */
export async function renderFixture(): Promise<string> {
  return await renderToStream(() => <Tree />);
}
