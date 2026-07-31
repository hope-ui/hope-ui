# `createScrollLock`

Locks `document.body` scrolling while active, compensating for the scrollbar-width
layout shift with a matching `padding-inline-end`. Built fresh for hope-ui.

## API

```ts
function createScrollLock(options: { active: Accessor<boolean> }): void;
```

- `active` — whether the lock is currently engaged.

## Behavior

Ref-counted: if two locks are active at once (e.g. two overlays open simultaneously), the
body's original `overflow`/`padding-inline-end` are only snapshotted on the *first* lock and only
restored once the *last* active lock releases. This makes it safe for multiple independent
components (a Dialog and a Popover, or two Dialogs) to each call `createScrollLock` without
one's deactivation prematurely unlocking scroll for the other.

## Why `padding-inline-end`, not `padding-right`

An RTL engine puts the viewport scrollbar on the **left**. Physical compensation would pad the edge
that did *not* lose the scrollbar, so opening any overlay shifts the page by exactly the width this
code exists to absorb — silently, and in every RTL locale. The logical property tracks whichever
edge the scrollbar actually occupied. This is the same rule the recipes follow
(`__internal__/theming.md`, "RTL-aware recipes", enforced by `pnpm check:rtl-safety`).

**Test coverage note.** The compensation *arithmetic* is covered, and only became coverable once the
browser project stopped hiding its scrollbars. It runs when `window.innerWidth -
document.documentElement.clientWidth` is positive, which measured 0 for as long as the project took
Playwright's launch defaults: Playwright pushes `--hide-scrollbars` on **every** headless launch
(`_innerDefaultArgs`, gated on `options.headless`). Overlay scrollbars were never the cause, and
`--disable-features=OverlayScrollbar` changes nothing here. `vitest.config.ts` drops the arg with
`launchOptions: { ignoreDefaultArgs: ["--hide-scrollbars"] }`, which yields a real 15px gutter in the
`chromium-headless-shell` build CI installs — not a full-Chromium-only capability — and left all 553
browser tests passing.

The tests therefore pin the arithmetic (`current + scrollbarWidth`, additive over an existing
`padding-inline-end`) **and** the edge it lands on: `padding-right` under `ltr`, `padding-left` under
`dir="rtl"`. Each one first asserts `gutter > 0`, so if the launch arg ever comes back the tests fail
loudly instead of passing vacuously.

## Where the ref count lives, and why it matters

On `document.body`, under `Symbol.for("hope-ui.scroll-lock")` — **not** at module scope.

`@hope-ui/primitives` is an internal/advanced package, but `@hope-ui/components` still depends on
it as a plain `dependencies` entry (and carries it transitively to consumers). Neither forces a single installed instance: a consumer can end up with
two copies of this package in their tree, at which point two module-scope counters each
believe they own the body. The observable failure is that `overflow: hidden` is restored while
a dialog is still open, or never restored at all — the exact opposite of what the ref count
promises, and impossible to reproduce in this repo's CI, where there is only ever one copy.

`Symbol.for` resolves through the cross-realm global symbol registry, so every copy of the
module reads and writes the same slot on the same `document.body`. Base UI stores its lock
state on the element for the same reason. `createHideOutside` stores its own per-element
ref count the same way.

`scroll-lock.browser.test.tsx` pins this by importing a genuinely separate module instance
(via a `?instance=2` query, which Vite serves as a distinct module) and checking the two
compose.

## SSR

All `document`/`window` access happens inside `createEffect`, gated on `active()`. Never
runs during SSR, no manual `isServer` guard needed.

## Example

```tsx
function Dialog(props: { open: boolean }) {
  createScrollLock({ active: () => props.open });
  return <div>...</div>;
}
```

## Rejected alternatives

### A module-scope ref count

**Why not:** Nothing forces a consumer to have a single installed copy of `@hope-ui/primitives` —
it is a plain `dependencies` entry, carried transitively by `@hope-ui/components`. Two copies means
two counters each believing they own `document.body`, and the observable result is `overflow:
hidden` restored while a dialog is still open, or never restored at all. It reproduces on nobody's
machine, least of all in this repo's CI, where there is only ever one copy. See *Where the ref count
lives, and why it matters* above.

### `body.style.paddingRight` for the scrollbar compensation

**Why not:** An RTL engine puts the viewport scrollbar on the **left**, so padding the right edge
adds the gutter to the side that never lost one — opening any overlay shifts the page by exactly the
width this code exists to absorb, doubling the shift instead of absorbing it. It shipped that way
and was one of the two silent defects that motivated `pnpm check:rtl-safety` (`1795afa`); the CSSOM
half of that scan exists because this line is the only way the defect was reachable.

### `@solid-primitives/scroll`'s `createPreventScroll`

**Why not:** Its cross-instance safety is unaudited, and cross-instance safety is the whole reason
this primitive's state sits on `document.body` under a `Symbol.for` key. Adopting it would trade a
pinned guarantee (`scroll-lock.browser.test.tsx`'s `?instance=2` import) for an unverified one.
Recorded in `__internal__/solid-primitives-eval.md` § *Tier B*.
