import { I18nProvider } from "@hope-ui/i18n";
import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import { CalendarDate } from "@internationalized/date";
import type { JSX } from "@solidjs/web";
import { renderToStream } from "@solidjs/web";
import { Calendar } from "../index";

// `calendar.ssr-entry.tsx`'s tree with the `I18nProvider` present but **no `locale` prop** — the
// "wrap it and let it detect the browser" advice. The provider renders `en-US` on the server *and* on
// the hydrating client, then adopts the detected locale once hydration has finished.
//
// Paired with `calendar-no-provider.ssr-entry.tsx`, which drops the provider entirely: the two differ
// in nothing but locale plumbing, so the browser tests over them measure that plumbing rather than
// the calendar.

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
export async function renderFixture(): Promise<string> {
  return await renderToStream(() => <Tree />);
}
