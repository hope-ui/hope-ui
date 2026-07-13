# SSR fixtures

`calendar-ssr.html` is the **genuine server output** of `<FullCalendar />` — a single-month
`<Calendar>` seeded deterministically so the fixture is byte-stable:

- `I18nProvider locale="en-US"` pins the month/weekday names (no dependence on the runner's browser
  locale).
- `timeZone="UTC"` pins date formatting.
- `defaultFocusedValue` is in **January 2020** — a month that can never be "today", so the
  `today()`-derived `data-today` attribute never appears, and the visible-month seed doesn't fall back
  to the (non-deterministic) system clock.

Generated and guarded by `../calendar.ssr.test.tsx` (the `ssr` project) via `toMatchFileSnapshot`,
hydrated by `../calendar.browser.test.tsx` (the `browser` project). See
`../../../button/__tests__/__fixtures__/README.md` for why the two halves cannot live in one project,
and `docs/testing.md` for the full picture.

**Never hand-edit this file.** Update it after an intentional markup change with
`pnpm exec vitest run --project=ssr -u`. Under `CI=true`, a missing or stale fixture fails rather than
being written.

The `_hk=…` attributes are Solid's hydration keys — a path through the component tree. Inserting any
component before another in either test's `FullCalendar` shifts them, so the two `FullCalendar`
definitions must stay structurally identical. A few notes on what is and isn't in the fixture:

- The focused cell (Jan 15) carries `tabindex="0"` and `data-focused` — both derive from a date
  comparison, so they are correct in the server markup without JS.
- The grid's `aria-labelledby` points at the heading's `id` (a single `createUniqueId`), so the IDREF
  is valid server-side.
- `data-today` is absent (Jan 2020 is never "today"), which is what makes the fixture date-independent.
