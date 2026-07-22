import { I18nProvider } from "@hope-ui/i18n";
import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import { CalendarDate } from "@internationalized/date";
import type { JSX } from "@solidjs/web";
import { renderToStringAsync } from "@solidjs/web";
import { Calendar } from "../index";

// The single source of truth for Calendar's SSR → hydration round-trip tree, shared by
// `calendar.ssr.test.tsx` (renders it, inline-snapshots the bytes), `calendar.browser.test.tsx`
// (passes it to hydrateFixture and drives it), and the hydration-fixture bridge (renders it
// server-side to feed the browser test). Reusing one tree enforces "structurally identical server
// and client" — hydration keys are a path through the component tree.
//
// Deterministic-by-construction for a byte-stable render:
// - `<ThemeProvider preset={hope}>` resolves the `calendar` recipe (a zero-DOM provider — hope's
//   token values live in CSS), so the round-trip exercises the real styled markup. It must be present
//   identically on server and client because it shifts `_hk` keys.
// - `locale="en-US"` via `I18nProvider` — pins month/weekday names on both server and client (no
//   dependence on the runner's browser locale).
// - `timeZone="UTC"` — pins date formatting.
// - `defaultFocusedValue` in **January 2020** — a month that can never be "today", so `data-today`
//   never appears and the seed doesn't fall back to the (non-deterministic) system clock.
// - `defaultValue` (Jan 10) + `name="date"` — a committed selection so the tree exercises both a
//   painted `data-selected` cell (distinct from the separately-focused Jan 15) and a rendered hidden
//   `<input>` for native form submission.

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
export function renderFixture(): Promise<string> {
  return renderToStringAsync(() => <Tree />);
}
