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
- `aria-label` defaults to `messages.previousLabel` ("Previous"), overridable via the consumer's
  `aria-label`.
