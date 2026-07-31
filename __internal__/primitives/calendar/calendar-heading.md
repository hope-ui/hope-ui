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
- `disabled` + `data-disabled` at the top of the stack (decade), where there is nothing to climb to,
  **or** when the whole calendar is `disabled`. The two fold in here rather than into `canDrillUp`,
  which answers "is there a view above this one" — not "may the user interact". `drillUp()` itself
  no-ops on a disabled calendar too, so a forced click changes nothing either.
- `id` is the calendar's `headingId` — the value the grid points `aria-labelledby` at. This is a single
  SSR-stable id, so a consumer's `id` prop is intentionally not honored (it would break that link).

## Rejected alternatives

### Forwarding the consumer's `id`
**Why not:** the grid's `aria-labelledby` points at `headingId`, so a consumer `id` winning here leaves
that IDREF dangling and the grid with no accessible name. `id` is the one native attribute this part
omits from what it forwards.

### Folding the whole-calendar `disabled` into `canDrillUp`
**Why not:** `canDrillUp` is a public computed answering "is there a view above this one", not "may the
user interact" — overloading it would make a `disabled` month calendar report that there is no year
view to climb to. The two fold together in this part instead, where the question really is
interactivity.
