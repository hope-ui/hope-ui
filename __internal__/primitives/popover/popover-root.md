# `createPopover` (popover hook family)

The headless behavior core of a **non-modal** floating layer — the shape `@hope-ui/components`'
`Popover` is a thin JSX layer over. Same decomposition as `createDialog` (one hook per part, modeled
on React Aria's `useDialog`/`useOverlay*` split), over a different substrate: `createFloating` +
`createDismissable` + `createPresence` + `createFocusRestore` composed directly, never Dialog's modal
machinery. Exported as one subpath, `@hope-ui/primitives/popover`.

| Hook | Owns |
| ---- | ---- |
| `createPopover(options)` | Shared state: open, the popup/title/description ids, every shared element ref, the positioning layer, the overlay presence. Renders nothing. Call **once**. |

The part hooks (`createPopoverTrigger`, `createPopoverAnchor`, `createPopoverPositioner`,
`createPopoverContent`, `createPopoverArrow`, `createPopoverTitle`, `createPopoverDescription`,
`createPopoverCloseTrigger`) each take this state plus their own props and own the rest — their
effects, their id-and-element registration, their consumer-prop precedence. All eight have shipped,
each with its own doc in this folder; this file documents the root only.

**Non-modal, deliberately.** Nothing here traps focus, locks page scroll, hides the page from
assistive technology or blocks the pointer. That is the whole point of the component: it is the
roadmap's "compose, don't inherit from Dialog" proof. A `modal` mode is later work, and adding
`createFocusTrap`/`createScrollLock`/`createHideOutside`/`ModalBackdrop` here is how this re-becomes
Dialog.

## `createPopover(options)`

```ts
function createPopover(options?: {
  open?: boolean;                     // controlled; pass a getter for reactive control
  defaultOpen?: boolean;              // uncontrolled initial state, default false
  onOpenChange?: (open: boolean) => void;
  closeOnEscape?: boolean;            // default true
  closeOnInteractOutside?: boolean;   // default true
  closeOnFocusOutside?: boolean;      // default true  ← Popover's default, not the kernel's
  role?: PopoverRole;                 // "dialog" (default) | "alertdialog"
  bubbles?: DismissBubbles;           // opt a dismiss channel back into bubbling to the layer below;
                                      // absent means neither channel does

  // Positioning — forwarded to createFloating as getters. No defaults applied here.
  side?: SideOrLogical;  align?: FloatingAlign;
  sideOffset?: number;   alignOffset?: number;
  flip?: boolean;        shift?: boolean;
  collisionPadding?: Padding;  collisionBoundary?: Boundary;  arrowPadding?: number;
  strategy?: Strategy;   autoUpdate?: boolean;  trackAnchorMotion?: boolean;
}): {
  open: Accessor<boolean>;
  setOpen: (open: boolean) => void;
  role: Accessor<PopoverRole>;
  closeOnEscape: Accessor<boolean>;
  closeOnInteractOutside: Accessor<boolean>;
  closeOnFocusOutside: Accessor<boolean>;
  bubbles: Accessor<DismissBubbles | undefined>;  // forwarded to createDismissable by createPopoverContent

  popupId: Accessor<string>;                    // registered id, else SSR-stable generated fallback
  setPopupId: (id: string | undefined) => void;
  titleId: Accessor<string | undefined>;
  setTitleId: (id: string | undefined) => void;
  descriptionId: Accessor<string | undefined>;
  setDescriptionId: (id: string | undefined) => void;

  triggerElement: Accessor<HTMLElement | undefined>;
  setTriggerElement: (element: HTMLElement | undefined) => void;
  customAnchorElement: Accessor<HTMLElement | undefined>;
  setCustomAnchorElement: (element: HTMLElement | undefined) => void;
  anchorElement: Accessor<HTMLElement | undefined>;   // customAnchorElement() ?? triggerElement()

  positionerElement: Accessor<HTMLElement | undefined>;
  setPositionerElement: (element: HTMLElement | undefined) => void;
  contentElement: Accessor<HTMLElement | undefined>;
  setContentElement: (element: HTMLElement | undefined) => void;
  arrowElement: Accessor<HTMLElement | undefined>;
  setArrowElement: (element: HTMLElement | undefined) => void;

  dismissExclusions: Accessor<Element[]>;       // [trigger] — createDismissable's `exclude`
  contentPresence: PresenceState;               // shared by Content + Positioner
  floating: CreateFloatingReturn;
};
```

- `open` / `defaultOpen` / `onOpenChange` — controlled/uncontrolled open state, resolved per-read by
  `createControllableState`. For reactive controlled use pass a getter (`get open() { return
  signal(); }`), exactly as a component prop would.
- `closeOnEscape` / `closeOnInteractOutside` / `closeOnFocusOutside` — the three dismissal toggles.
  They live on the root (a consumer sets them once) and are consumed by `createPopoverContent`, which
  forwards them to its `createDismissable` as `dismissOnEscape` / `dismissOnOutsidePointerDown` /
  `dismissOnFocusOutside`. The returned accessors exist for that forwarding.
- `role` — an **ARIA** concern, so it lives here rather than being threaded in by the component:
  `createPopoverContent` reads it for the surface's `role` attribute. The trigger's `aria-haspopup`
  stays `"dialog"` for both values — ARIA defines no `alertdialog` token for it.
- ids — `popupId` falls back to a generated (SSR-stable) `createUniqueId`; a part publishes a
  consumer id via `setPopupId`/`setTitleId`/`setDescriptionId` (the id-registering part hooks wrap
  `createRegisteredId`, which never runs during SSR — hence the generated fallback).
- `initialFocus` is **not** here — it is a prop of `createPopoverContent`, the part that owns the
  autofocus effect and the only consumer. Same split as Dialog.

### `closeOnFocusOutside` defaults `true`, and the kernel option defaults `false`

`createDismissable`'s `dismissOnFocusOutside` is off by default so that Dialog's behavior is
unchanged and a modal layer — which traps focus — doesn't carry a dead listener. A non-modal popover
is the case the option was built for: Radix and Base UI both close one when focus leaves. So the
default is flipped **here**, in Popover's own vocabulary, rather than in the kernel.

The exclusion below is what makes it survivable: Shift+Tab back onto the trigger keeps the layer open
and `aria-expanded` truthful, while a *click* on the trigger still toggles it closed.

## The anchor precedence chain

```ts
anchorElement = () => customAnchorElement() ?? triggerElement();
```

The Trigger registers `triggerElement`; a `Popover.Anchor` registers `customAnchorElement` and wins.
It is a **derived accessor over two signals**, not a latched value, and that is what makes both
directions work: an Anchor mounting *after* the trigger re-runs `createFloating`'s attach effect so
`autoUpdate` re-points at it, and an Anchor unmounting *while the layer is open* hands positioning
back to the trigger instead of stranding it on a detached element. `createPopoverAnchor` clears its
registration through `createRegisteredElement`; both directions are pinned in
`popover-root.browser.test.tsx`, asserting the layer's **rect** — a different `anchorElement()` proves
nothing about whether the positioning layer noticed.

The chain leaves room for a third level (a virtual element, for a ContextMenu) without changing its
shape.

## `dismissExclusions`

`[trigger]`, and nothing else — fed straight to `createDismissable`'s `exclude` by
`createPopoverContent`. Without it a pointerdown on the trigger dismisses in the capture phase and
the trigger's own `click` reopens, so **the popover could never be closed by clicking the control
that opened it**. Dialog never hit this because it is modal by default.

### Why a `Popover.Anchor` is deliberately **not** excluded

`exclude` fixes a **toggle race**, not "everything belonging to the widget". The Anchor has no
handler and no ARIA relationship — it is a positioning reference, not a control — so a click on it
cannot reopen anything, and there is no race to fix.

Excluding it would be actively harmful. `exclude` matches with `element.contains(target)`, i.e. the
whole subtree, and `Popover.Anchor` is a bare wrapper a consumer may put around a card, a table row
or a whole section. Exempting it would turn that entire region into a dead zone where outside-click
silently stops dismissing — and the dead zone would grow with however large the consumer made the
anchor. "Clicking the anchor closes the popover" is what a reader expects of an outside click.

The focus half sharpens it. `exclude` also governs `dismissOnFocusOutside`, which Popover defaults
`true`. The Trigger belongs to the widget in the accessibility tree — it carries `aria-expanded` and
`aria-controls`, so Shift+Tab back onto it must keep the layer open and `aria-expanded` truthful.
The Anchor carries no such relationship, so focus landing on it *is* focus leaving the widget.

Base UI draws the same line: its `useDismiss` exempts `store.context.triggerElements` by name, and
the `anchor` its Positioner takes never enters that set (`floating-ui-react/hooks/useDismiss.ts`).
React Aria is not a data point either way — `usePopover` has no separate anchor, one `triggerRef`
being both the positioning target and the control.

The return type is `Accessor<Element[]>`, not a single element, so a later layer that genuinely needs
an exemption (a nested submenu trigger) is a one-line addition here rather than a redesign.

## Two orderings inside this hook are load-bearing

```
withDefaults → createControllableState → createUniqueId() for popupId
  → element signals → createPresence → createFloating
```

**1. `createUniqueId` must precede `createPresence` and `createFloating`.** It fixes the trigger's SSR
hydration key: `_hk` keys are a path through the component tree, and an id reserved earlier shifts
every later one. Same constraint, same comment, as `dialog-root.ts`.

**2. `createPresence` must precede `createFloating`, and be created *eagerly, here*.** `Popover.Content`
is mounted lazily — only once open — so a presence created inside `createPopoverContent` would see
`present` already `true` on its first run and latch straight to `"entered"`, skipping the enter
animation. Created at the root while `open` is `false`, its first run observes the closed state, so
opening drives `entering → entered`. Content and Positioner consume the same one.

`createFloating` is root-owned for a different reason — **sharing**, not correctness. It tracks its
elements in the compute of its own effect, so a late positioner ref is fine wherever the call lives.
But `side()` is read by the Positioner *and* the Arrow, and `arrowElement` must reach its config
memo; a positioner-owned call would need a second context or a descendant→ancestor write
(`[REACTIVE_WRITE_IN_OWNED_SCOPE]`).

## `createFloating` gets `active: () => contentPresence.mounted()`, never `open`

`createFloating`'s config effect does `!active → setIsPositioned(false)`, and `floatingStyles()` then
reverts to `{ position, left: 0, top: 0, visibility: "hidden" }`. Keyed on `open`, that fires **the
instant the popover closes** — while the presence is still holding the content mounted for its exit
transition. The layer would vanish instead of animating out. Keyed on `mounted()` it stays positioned
until the exit actually ends, and `autoUpdate` stays attached so a closing layer can't drift either.

Dismissal, focus restore and autofocus still key off `open`: they should stop the moment the popover
is logically closed, regardless of how long the paint takes.

This is a **consumer anti-pattern of `createFloating`** — any layer with an exit transition passes
`active: mounted()`. It is pinned by a per-frame sampler at the component layer (every
`presence === "exiting"` sample must still be `visibility: visible`); nothing at this layer can see
it, because with no authored exit transition `mounted()` and `open()` are the same signal.

## Positioning options live on the root — a deliberate divergence from Base UI

`side`/`align`/`sideOffset`/`alignOffset`/`flip`/`shift`/`collisionPadding`/`collisionBoundary`/
`arrowPadding`/`strategy`/`autoUpdate`/`trackAnchorMotion` are options of **`createPopover`**, not of
the Positioner part. Base UI spells them on its `Popover.Positioner`; hope-ui takes its *vocabulary*
(`side`/`align`/`sideOffset`, over floating-ui's single `placement` string) and its own placement.

It follows from `createFloating` being root-owned, and it matches Dialog's precedent — `closeOnEscape`
and `role` are `Dialog.Root` options even though `Dialog.Content` is what consumes them.

**`trackSize` is not among them: it is passed as a literal `true`, not exposed.** Every popover
measures its anchor, and `createPopoverPositioner` publishes the result as `--anchor-width` and its
three siblings — see [`popover-positioner.md`](popover-positioner.md) for why that is unconditional
and what it costs. The middleware only reads rects; nothing is written onto the layer, so the
measurement-only contract `create-floating.md` describes is intact. `createFloating`'s own `trackSize`
default stays `false` for every other consumer.

They are forwarded as **getters**, never read once:

```ts
createFloating({
  active: () => contentPresence.mounted(),
  anchor: anchorElement,
  floating: positionerElement,
  arrowElement,
  get side() {
    return merged.side;
  },
  // …
});
```

That is `createFloating`'s documented idiom and the only shape in which changing `side` re-measures
instead of needing a remount.

**No offset defaults are applied here.** `createFloating` supplies structural defaults (`bottom`,
`center`, `flip`/`shift` on); the *visual* ones — a non-zero `sideOffset`, `collisionPadding`,
`arrowPadding` — belong to the component layer, where a preset can theme them.

`arrowElement` is passed unconditionally. What enables floating-ui's `arrow` middleware is the
*element* arriving, which `createFloating` tracks in its config memo — so a popover with no arrow and
one whose arrow ref arrives late both work with no branch here.

## Popover takes no locale, and writes no `dir`

There is no `dir` option, no `@hope-ui/i18n` import, and no `createTextDirectionWarning`.

`createFloating` resolves a logical `side` against `getComputedStyle(floating).direction` — the same
call floating-ui's own `platform.isRTL(elements.floating)` makes, on the same element. One channel,
nothing to disagree with, and no locale import inside the positioning layer.

Writing a locale-derived `dir` would be actively wrong (`f308cfb`): `useLocale().direction` never
returns "nothing" — with no provider it reports the *detected browser* direction — so a popover
nobody configured would stamp `dir="ltr"` on itself and override the `dir="rtl"` it was rendered
into, stopping an ancestor's direction from cascading. That commit surveyed the references: across
react-aria, react-stately and react-aria-components a locale-derived `dir` is written in exactly two
files, `Popover` and `Toast`, and both portal to `document.body` — a portal repair, not a policy. Our
portals mount into `document.body` too, which inherits from the document root, so there is nothing to
repair. Base UI writes none at all.

`createTextDirectionWarning` exists to catch a **keymap-vs-layout** split — a component whose arrow
keys mirror while its layout does not. Popover has no keymap, so it has no such split.

A consumer who does need to force a direction on a portaled layer forwards `dir` to
`Popover.Positioner` as an ordinary native attribute. That is the escape hatch, and it is one the
part-forwarding rule gives for free.

## Call it once, in an owner scope

`createPopover` runs inside a reactive owner (a component body or `createRoot`). Call it **once** and
share the result: `Popover.Root` puts it on context; a headless consumer holds it and threads it into
whichever part hooks it needs. The id- and element-registering part hooks must be called from the
part that owns the id/element, so each registration's cleanup is scoped to that part's unmount.

## The component-layer `Popover.Root` renders no element — and that is what keeps it `omit`-free

`@hope-ui/components`' `Popover.Root` is the JSX layer over this hook, and it renders **only a
provider**: no host element, no `class` prop, no `render` prop, no native-attribute passthrough. It is
one of the two exemptions to CLAUDE.md's *every public part forwards its DOM props and takes `render`*
rule (`Popover.Portal` is the other), exactly as `Dialog.Root`/`Dialog.Portal` are.

The consequence worth stating out loud: **it is therefore the one Root in the catalog with no
hand-kept `omit` list.** `Calendar.Root` and `Listbox.Root` each carry a long literal key list — every
option of their primitive plus every themeable prop — because they *do* render an element and must
subtract their own props from what gets forwarded onto it. `Popover.Root` has nothing to forward, so
the list would be dead weight that silently rots as `CreatePopoverOptions` grows.

That absence looks like an oversight to anyone auditing the family against its siblings. It is not.
**Do not "fix" it by adding one** — the fix would be adding a host element, which is the thing being
avoided. Every positioning option on this hook is consumed *here* and shared through context; the
escape hatch for a native attribute on the DOM is `Popover.Positioner` — which is where a portaled
layer's `dir` goes, per the section above.

## SSR

Host-element-free and effect-gated. `createFloating` reaches `computePosition`/`autoUpdate` from
effect bodies alone and `createPresence` from an effect, so neither runs under `renderToStream`
— no `isServer` import is needed here, the same convention `createDismissable` follows. The server
renders `floatingStyles()`'s pre-positioned branch, a constant with no client-only input, and
`side()`/`align()` seed from the config, so `data-side` is identical on both sides of the round-trip.

The generated `popupId` is an SSR-stable `createUniqueId`, and the only one the root consumes — see
the ordering section above, and `__internal__/testing.md` on how `_hk` keys and the SSR → hydrate
round-trip are pinned.

## Rejected alternatives

### Routing Popover's overlay behavior through Dialog's modal machinery
**Why not:** it ties a non-modal layer to Dialog's internals and makes every floating consumer pull in
scroll-lock, pinch-zoom prevention and hide-outside it never uses — the anti-pattern `plan.md` names by
name. Popover composes `createFloating` + `createDismissable` + `createPresence` + `createFocusRestore`
directly instead, which is what makes it the roadmap's "compose, don't inherit from Dialog" proof.

### Base UI's placement for the positioning options (on `Popover.Positioner`)
**Why not:** `createFloating` has to be root-owned — `side()` is read by the Positioner *and* the
Arrow, and `arrowElement` must reach its config memo — so a Positioner-owned call would need either a
second context or a descendant writing an ancestor-owned signal, which Solid 2.0 throws
`[REACTIVE_WRITE_IN_OWNED_SCOPE]` on. The *vocabulary* (`side`/`align`/`sideOffset` over floating-ui's
single `placement` string) is still Base UI's. See *Positioning options live on the root* above.

### `active: state.open` for `createFloating`
**Why not:** `createFloating`'s config effect does `!active → setIsPositioned(false)`, so keying on
`open` reverts `floatingStyles()` to its unpositioned, hidden branch the instant the popover closes —
while the presence is still holding the content mounted for its exit transition, so the layer vanishes
instead of animating out. See *`createFloating` gets `active: () => contentPresence.mounted()`* above.

### Flipping `dismissOnFocusOutside`'s default inside `createDismissable`
**Why not:** it would change Dialog's behavior and leave every modal layer — which traps focus, so the
listener can never fire — carrying a dead document listener. The flip lives in Popover's own vocabulary
instead, where the non-modal case that wants it actually is.

### `Popover.Anchor` in `dismissExclusions`
**Why not:** `exclude` matches with `element.contains(target)`, so exempting a wrapper a consumer may
put around a card, a table row or a whole section turns that entire region into a dead zone where
outside-click silently stops dismissing — and, since `exclude` governs the focus half too, focus
landing on the anchor would count as focus still inside the widget, which it is not. See *Why a
`Popover.Anchor` is deliberately not excluded* above.

### A locale-derived `dir` written onto the layer
**Why not:** `useLocale().direction` never reports "nothing" — with no provider it reports the
*detected browser* direction — so a popover nobody configured would stamp `dir="ltr"` over the
`dir="rtl"` it was rendered into and stop an ancestor's direction from cascading (`f308cfb`).
react-aria writes one in exactly two files, both of which portal to `document.body`; that is a portal
repair, and our portals inherit from the document root, so there is nothing to repair. See *Popover
takes no locale, and writes no `dir`* above.

### A hand-kept `omit` list on the component-layer `Popover.Root`
**Why not:** the Root renders no element, so the list would subtract keys from props that are
forwarded nowhere — dead weight that rots silently as `CreatePopoverOptions` grows. The only way to
make one load-bearing is to give the Root a host element, which is the thing being avoided. See *The
component-layer `Popover.Root` renders no element* above.
