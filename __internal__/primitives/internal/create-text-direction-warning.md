# `createTextDirectionWarning`

Dev-only. Warns when the direction a component's **keymap** uses disagrees with the direction the
browser **lays that component out** in. Also the home of the `TextDirection` type, which both
navigation kernels and both hook families import.

Used by `createListbox` (horizontal only) and `createCalendar` (always).

## API

```ts
type TextDirection = "ltr" | "rtl";

function createTextDirectionWarning(options: {
  name: string;                                        // "Listbox", "Calendar"
  direction: Accessor<TextDirection>;                  // what the keymap mirrors against
  element: Accessor<HTMLElement | null | undefined>;   // what the browser lays out
  active?: Accessor<boolean>;                          // default true
}): void;
```

## Two channels, deliberately not joined

Reading direction reaches a component down two independent paths:

| channel | source | what reads it |
|---|---|---|
| **Layout** | CSS `direction` — the `dir` attribute and its cascade | every logical utility a recipe emits (`ps-`/`pe-`/`end-`/`rounded-s-`/`rtl:`), and a `<table>`'s column order |
| **Arrow keys** | `useLocale().direction()` — the `I18nProvider` locale | `createListNavigation` / `createGridNavigation` `textDirection` |

hope-ui does **not** join them, and that is the same line the references draw:

- **Base UI** — `DirectionProvider` takes an explicit `direction` (not a locale), renders no DOM, and
  no component ever writes `dir`. Its RTL tests declare **both**:
  `<div dir="rtl"><DirectionProvider direction="rtl">…`.
- **React Aria** — `I18nProvider` derives direction from a locale exactly as `@hope-ui/i18n` does, and
  renders no DOM. `useCalendarGrid` reads `useLocale().direction` for the ArrowLeft/ArrowRight flip
  and puts **no `dir` in `gridProps`**. Across `react-aria`, `react-stately` and
  `react-aria-components`, a locale-derived `dir` is written in exactly two files —
  `Popover.tsx` and `Toast.tsx` — and both **portal to `document.body`**, escaping the cascade. It is a
  portal repair, not a policy.

A consumer's own `dir` prop *is* written to the element (`Listbox.Root`, `Calendar.Root`), which
matches RAC's `dir={props.dir}` passthrough. A **locale-derived** one is not: `useLocale().direction`
never returns "nothing", so writing it would stamp `dir="ltr"` on an en-US browser and override the
`<div dir="rtl">` the component was rendered into.

## Why warn, then

Because declaring one channel and not the other is silent. `<I18nProvider locale="ar-EG">` with no
`dir` anywhere gives Arabic month names, Arabic-Indic numerals, and reversed arrows over a grid still
laid out left-to-right with Sunday on the left. That is the app under-declaring, and the fix is one
line —

```ts
document.documentElement.dir = getReadingDirection(locale());
```

— but nothing tells you. Silent RTL mis-paint is the failure mode this repo keeps paying for (it is
why `pnpm check:rtl-safety` exists), so the split gets said out loud, in dev, naming both readings and
the fix:

```
[hope-ui] Calendar: its arrow keys mirror "rtl" (from the locale) but the browser lays it out "ltr",
so navigation will run opposite to what the user sees. Reading direction reaches the DOM only through
the cascade: set `dir` on your document root (`document.documentElement.dir =
getReadingDirection(locale())`), or pass `dir="rtl"` to this component.
```

## `active` — don't warn where it can't be observed

A **vertical** listbox maps Up/Down, where direction changes nothing at all, so `createListbox` passes
`active: () => orientation() === "horizontal"`. Without that gate, every app that merely hasn't set
`dir` yet would get a warning per listbox for a mismatch no user can perceive. A calendar grid is 2D,
so `createCalendar` passes nothing and always checks.

## Scope and limits

- Gated on `import.meta.env.DEV`, read through a local cast so this package needn't pull `vite/client`
  into `compilerOptions.types` — the same shape as `@hope-ui/i18n`'s `warnMissing`.
- Re-runs on `direction` / `element` / `active` change. That covers the realistic runtime flip: an app
  switching locale without updating the document.
- An **ancestor's `dir` changing** while the locale stays put is *not* observed. Computed style is not
  reactive; catching it needs a `MutationObserver` over the ancestor chain, which is more machinery
  than a dev warning is worth.
- A detached element reports `""` for its computed direction — treated as "no layout to disagree with"
  rather than as `ltr`.
- `mount()` only fails a test on Solid's own diagnostic codes, so this warning is forwarded, not
  fatal. Tests that provoke it spy on `console.warn`.

## Example

```ts
const direction = () => merged.dir ?? i18n.direction();

createTextDirectionWarning({
  name: "Listbox",
  direction,
  element: listboxElement,
  active: () => orientation() === "horizontal",
});

createListNavigation({ focus, orientation, textDirection: direction });
```

## Rejected alternatives

### Writing the locale-derived direction onto the element as `dir`

**Why not:** This is what shipped first, and it broke the cascade it was meant to serve.
`useLocale().direction` never returns "nothing" — with no `I18nProvider` it reports the *detected
browser* direction — so a `Calendar` or `Listbox` nobody had configured stamped `dir="ltr"` on
itself and overrode the `<div dir="rtl">` it was rendered into, stopping an ancestor's direction
from cascading at all (`f308cfb`). Both references draw the same line: Base UI's `DirectionProvider`
and React Aria's `I18nProvider` render no DOM, and `useCalendarGrid` puts no `dir` in `gridProps`.
The warning exists because that fix left the two channels able to disagree silently — see *Two
channels, deliberately not joined* and *Why warn, then* above.

### Saying nothing, and letting the mismatch be the app's problem

**Why not:** It genuinely *is* the app's problem — and it is invisible. `<I18nProvider
locale="ar-EG">` with no `dir` anywhere renders Arabic month names, Arabic-Indic numerals and
reversed arrow keys over a grid still laid out left-to-right with Sunday on the left, with nothing
failing anywhere. Silent RTL mis-paint is the failure mode this repo keeps paying for; it is why
`pnpm check:rtl-safety` exists, and a lint rule cannot reach a mismatch that only exists at runtime.

### Warning unconditionally, with no `active` gate

**Why not:** A vertical listbox maps Up/Down, where reading direction changes nothing a user can
perceive. Without the gate every app that merely hasn't set `dir` yet gets one warning per listbox
for a mismatch with no consequence — and a dev warning that cries wolf is one developers filter out,
taking the calendar's real one with it.

### A `MutationObserver` over the ancestor chain, to catch a `dir` flip upstream

**Why not:** Computed style is not reactive, so the only way to observe an ancestor's `dir` changing
while the locale stays put is to watch every ancestor of every instance. That is a permanent
per-instance observer to catch a case the realistic runtime flip — an app switching *locale* without
updating the document — already covers through the effect's own dependencies.
