# `createPresence`

Tracks mount/unmount timing across an exit CSS transition or animation, so a component
can stay in the DOM long enough for an authored exit animation to finish before actually
unmounting. Built fresh for hope-ui, modeled on Base UI's transition-status handling.

## API

```ts
function createPresence(options: {
  present: Accessor<boolean>;
  ref: Accessor<HTMLElement | null | undefined>;
  initialEnter?: boolean;
}): {
  mounted: Accessor<boolean>;
  status: Accessor<"entering" | "entered" | "exiting" | "exited">;
};
```

- `present` — whether the content *should* be present.
- `ref` — the rendered element. Used only when `present` becomes `false`, to read its
  computed `transition`/`animation` duration (and delay) and decide whether to wait for an
  end event before unmounting.
- `initialEnter` — play the enter animation on the *first* mount when `present` starts
  `true`, instead of appearing already `"entered"`. Off by default (see below).
- `mounted` — whether the consumer should render its DOM output at all. Gate rendering
  on this, not on `present` directly, so the exit animation has something to animate.
- `status` — the lifecycle status: `"entering"` on the first frame after becoming present,
  flipping to `"entered"` on the next animation frame (so a CSS transition keyed off the
  `entering`→`entered` attribute change actually fires); `"exiting"` immediately when
  `present` becomes `false`; `"exited"` once unmounted.

## First mount and `initialEnter`

The split `createEffect(compute, effect)` runs its effect for the initial value too (pinned
in `solid-contract.test.ts`). By default the first run is latched so an already-present
element lands directly on `"entered"` — a `defaultOpen` Dialog paints in its final state
rather than replaying its transition on load. Pass `initialEnter: true` to opt into the
enter animation on that first mount (start `"entering"`, flip to `"entered"` next frame).
Every *subsequent* becoming-present is a real open and always animates regardless.

## The `data-presence` attribute

**Every component that composes `createPresence` exposes `status()` as `data-presence`.**
That's the house convention, and the only reason it's written down here rather than left to
each component: `Dialog`, and every future Popover/Tooltip/Select, must agree, or a consumer's
stylesheet stops working the moment they swap one overlay for another.

Not `data-status`. That name says neither *whose* status nor *which* status, and it leaves the
obvious name unavailable for a component that genuinely has a domain status of its own.

The attribute is **component-owned** — a consumer cannot override it, because its value is
derived entirely from state they don't control. See `Dialog.md`'s prop-precedence table.

## Exit behavior — end events, cancels, and the backstop

When `present` becomes `false`, `getComputedStyle` reads the element's exit timing:

- **No authored duration** → `getComputedStyle` reports `0s` and unmounting is immediate. This
  primitive never waits indefinitely for an end event that a plain (unstyled) headless consumer
  will never fire.
- **A duration is authored** → unmounting waits for `transitionend`/`animationend`, guarded on
  `event.target === element` so a descendant's bubbling event doesn't unmount early.

Two failure modes are handled so a `present === false` element can never be stranded mounted:

- **`transitioncancel`/`animationcancel`** are also listened for. A transition interrupted by
  `display: none`, a property reset, or similar fires `*cancel`, not `*end`.
- A **fallback `setTimeout`** armed at `delay + duration + buffer` unmounts even if no event fires
  at all (a backgrounded tab may deliver none). All completion routes through a single idempotent
  `finish()`, and the timer + listeners are cleared on the effect's cleanup.

## `createPresenceItem` — animating between items

```ts
function createPresenceItem<T>(options: {
  item: Accessor<T | undefined | null | false>;
  ref: Accessor<HTMLElement | null | undefined>;
  initialEnter?: boolean;
}): {
  mounted: Accessor<boolean>;
  status: Accessor<"entering" | "entered" | "exiting" | "exited">;
  mountedItem: Accessor<T | undefined>;
};
```

The same machine over a *value* instead of a boolean. A nullish or `false` `item` means "nothing
present". Swapping from item A to item B **exits A first**, keeping A in `mountedItem` (and mounted)
through its exit animation, then enters B — so the outgoing content animates out before the incoming
content animates in. It composes the boolean core, so exit timing, `status`, and the cancel/fallback
backstop are identical. `mountedItem` is boxed internally for the same reason
`createControllableState` boxes: a function-valued `T` would otherwise be swallowed by
`createSignal`'s compute-function overload.

## Its ref/seed reads are deliberately untracked

`present()`/`item()` are read once via `untrack` to seed the initial `mounted`/`status` signals
(seeds must be read once and never re-read; otherwise Solid labels a `[STRICT_READ_UNTRACKED]`
warning with the *caller's* component name, and `mount()` fails any test that emits one). `ref()` is
read via `untrack` inside the effect's exit branch.

That last read is the opposite of what `createFocusTrap`/`createDismissable` need. They read the ref
on the **activating** edge, racing the effect that creates the element, so they must track it in
`compute` (see `focus-trap.md`). This reads it on the **exit** edge, when the element has been in the
document since the entering run. Tracking it here would rerun the effect — re-entering the exiting
branch — every time the element is replaced.

## SSR

All `window`/DOM access happens inside `createEffect`. Never runs during SSR — the
initial `mounted`/`status` signal values are computed from `present()`/`item()` synchronously
(no DOM read), so SSR output reflects the initial state correctly.

## Example

```tsx
function Popup(props: { open: boolean }) {
  // A signal-backed ref, not `let ref; ref={ref}`. `createPresence` alone would survive the
  // plain `let` — it reads the ref only on the exit edge, by which point the element exists —
  // but every sibling primitive that reads a ref on the *activating* edge would silently
  // break, and refs get shared between them. See focus-trap.md.
  const [ref, setRef] = createSignal<HTMLDivElement>();
  const { mounted, status } = createPresence({ present: () => props.open, ref });

  return (
    <Show when={mounted()}>
      <div ref={setRef} data-presence={status()}>
        content
      </div>
    </Show>
  );
}
```

```css
[data-presence="entering"] { opacity: 0; }
[data-presence="entered"] { opacity: 1; transition: opacity 150ms; }
[data-presence="exiting"] { opacity: 0; transition: opacity 150ms; }
```
