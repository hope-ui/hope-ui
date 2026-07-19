# `createCalendarHeading`

The heading / view switcher — a `<button>` showing the current period label that drills **up** the view
stack (month → year → decade) on click.

## API

```ts
function createCalendarHeading(
  state: CreateCalendarReturn,
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>,
): { props: JSX.ButtonHTMLAttributes<HTMLButtonElement> };
```

Render `<button {...props}>{state.headingLabel()}</button>`.

## Behavior

- `onClick` → `drillUp()` (composed behind the consumer's `onClick`).
- `disabled` + `data-disabled` at the top of the stack (decade), where there is nothing to climb to.
- `id` is the calendar's `headingId` — the value the grid points `aria-labelledby` at. This is a single
  SSR-stable id, so a consumer's `id` prop is intentionally not honored (it would break that link).
