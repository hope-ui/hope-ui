# `createCalendarNext`

The next-period button.

## API

```ts
function createCalendarNext(
  state: CreateCalendarReturn,
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>,
): { props: JSX.ButtonHTMLAttributes<HTMLButtonElement> };
```

Render `<button {...props}>…</button>` (the icon/label is the component's).

## Behavior

- `onClick` → `next()` — pages forward one period in the active view (±1 month / ±1 year / ±10 years),
  composed behind the consumer's `onClick`.
- `disabled` (combined with the consumer's) + `data-disabled` reflect `isNextDisabled()` — the whole
  next period lying after `max`.
- `aria-label` defaults to `messages.nextLabel` ("Next"), overridable via the consumer's `aria-label`.
