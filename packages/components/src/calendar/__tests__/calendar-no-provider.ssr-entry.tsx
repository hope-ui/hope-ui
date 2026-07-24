import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import { CalendarDate } from "@internationalized/date";
import type { JSX } from "@solidjs/web";
import { renderToStringAsync } from "@solidjs/web";
import { Calendar } from "../index";

// `calendar.ssr-entry.tsx`'s tree **minus the `I18nProvider`** — zero-config i18n, the shape an app
// gets when it never mounts one. Paired with `calendar-detected-locale.ssr-entry.tsx` (a provider with
// no `locale` prop), the two entries differ in nothing but locale plumbing, so the browser tests over
// them measure that plumbing rather than the calendar.
//
// What makes this worth a fixture: the server has no `navigator`, so it renders `en-US`
// (Sunday-first), and a visitor on a Monday-first locale would hydrate a grid whose model starts the
// week a day earlier than the markup. January 2020 spans 35 cells under either first-day-of-week, so
// hydration reuses every node and warns about nothing — the disagreement would be *silent*, visible
// only as a calendar that selects the neighbouring day. `readDetectedLocale`'s hydration gate is what
// prevents it, and this round-trip is what proves the gate works end to end.

export function Tree(): JSX.Element {
  return (
    <ThemeProvider preset={hope}>
      <Calendar.Root
        defaultValue={new CalendarDate(2020, 1, 10)}
        defaultFocusedValue={new CalendarDate(2020, 1, 15)}
        timeZone="UTC"
      >
        <Calendar.Header>
          <Calendar.PrevButton aria-label="Previous month" />
          <Calendar.Heading />
          <Calendar.NextButton aria-label="Next month" />
        </Calendar.Header>
        <Calendar.Grid />
      </Calendar.Root>
    </ThemeProvider>
  );
}

/** The server render the hydration-fixture bridge invokes. */
export function renderFixture(): Promise<string> {
  return renderToStringAsync(() => <Tree />);
}
