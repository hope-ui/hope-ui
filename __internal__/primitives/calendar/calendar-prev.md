# `createCalendarPrev`

The previous-period button.

## API

```ts
function createCalendarPrev(
  state: CreateCalendarReturn,
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>,
): { props: JSX.ButtonHTMLAttributes<HTMLButtonElement> };
```

Render `<button {...props}>…</button>` (the icon/label is the component's).

## Behavior

- `onClick` → `prev()` — pages back one period in the active view (±1 month / ±1 year / ±10 years),
  composed behind the consumer's `onClick`.
- `disabled` (combined with the consumer's) + `data-disabled` reflect `isPrevDisabled()` — the whole
  previous period lying before `min`.
- `aria-label` defaults to `state.t("calendar.previousLabel")` ("Previous"), overridable via the
  consumer's `aria-label`. It resolves through the `@hope-ui/i18n` catalog, not a `messages` prop —
  the `CalendarMessages` dictionary was dropped during implementation (see `calendar-root.md`'s
  rejected alternatives).

<!-- no-rejected-alternatives: a thin onClick + disabled mirror of `prev()` / `isPrevDisabled()`; every
paging and boundary decision it reflects (including why the button disables while a contiguous range
is anchored) is argued in calendar-root.md -->

