import { I18nProvider } from "@hope-ui/i18n";
import { CalendarDate } from "@internationalized/date";
import type { JSX } from "@solidjs/web";
import { renderToStringAsync } from "@solidjs/web";
import { Calendar } from "../calendar";

// The single source of truth for Calendar's SSR → hydration round-trip tree, shared by
// `calendar.ssr.test.tsx` (renders it, inline-snapshots the bytes), `calendar.browser.test.tsx`
// (passes it to hydrateFixture and drives it), and the hydration-fixture bridge (renders it
// server-side to feed the browser test). Reusing one tree enforces "structurally identical server
// and client" — hydration keys are a path through the component tree.
//
// Deterministic-by-construction for a byte-stable render:
// - `locale="en-US"` via `I18nProvider` — pins month/weekday names on both server and client (no
//   dependence on the runner's browser locale).
// - `timeZone="UTC"` — pins date formatting.
// - `defaultFocusedValue` in **January 2020** — a month that can never be "today", so `data-today`
//   never appears and the seed doesn't fall back to the (non-deterministic) system clock.

export function Tree(): JSX.Element {
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

/** The server render the hydration-fixture bridge invokes. */
export function renderFixture(): Promise<string> {
  return renderToStringAsync(() => <Tree />);
}
