import { I18nProvider } from "@hope-ui/i18n";
import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import { CalendarDate } from "@internationalized/date";
import type { JSX } from "@solidjs/web";
import { renderToStringAsync } from "@solidjs/web";
import { Calendar } from "../index";

// `calendar.ssr-entry.tsx`'s tree with the `I18nProvider` present but **no `locale` prop** — the
// "wrap it and let it detect the browser" advice. This is the SSR-seeded path: the provider renders
// `en-US` on the server *and* on the hydrating client, then adopts the detected locale in `onSettled`.
// Paired with `calendar-eager-locale.ssr-entry.tsx` (no provider at all), these two entries measure
// what wrapping actually buys on a visitor whose browser is not `en-US`, which is what the i18n doc
// page's guidance rests on.

export function Tree(): JSX.Element {
  return (
    <ThemeProvider preset={hope}>
      <I18nProvider>
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
      </I18nProvider>
    </ThemeProvider>
  );
}

/** The server render the hydration-fixture bridge invokes. */
export function renderFixture(): Promise<string> {
  return renderToStringAsync(() => <Tree />);
}
