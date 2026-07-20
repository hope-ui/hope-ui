# Dialog: fix `scrollBehavior` + add `Dialog.Positioner`

Status: **implemented.** This doc is the implementation brief; the "Changes" and "Verification"
sections below were carried out verbatim (theming contract + hope preset recipe + `@hope-ui/components`
Dialog, with the new `Dialog.Positioner` part). All checks in "Verification" pass; the inside/outside
scroll and centered-short-card mechanics were confirmed by eye in Storybook.

## Kickoff prompt (starting brief)

> Implement the `Dialog.Positioner` refactor described in
> `__internal__/dialog-positioner-and-scroll-behavior.md`. Two bugs to fix: (1)
> `scrollBehavior="inside"` doesn't scroll — the content overflows; (2) `scrollBehavior="outside"` is
> implemented on the Content card itself and should instead use a new, required `Dialog.Positioner`
> wrapper that is the `fixed inset-0` scroll container (Base UI / Ark / Chakra shape:
> `Portal > Backdrop + Positioner > Content`). Follow the "Final recipe" and "Changes" sections
> verbatim, then run the "Verification" checklist. Do NOT change `@hope-ui/primitives` — the fix is
> contained to `@hope-ui/theming`, `@hope-ui/presets/hope`, and `@hope-ui/components/dialog`. No
> changeset (v0.0.0). Confirmed decisions: Positioner is **required** (breaking, fine at v0.0.0);
> outside-scroll is **auto-margin centering** (centered when the card fits, top-anchored/top-reachable
> when it's taller than the viewport).

## Context

The styled `Dialog` (`@hope-ui/components/dialog`) recently gained `size`/`placement`/`scrollBehavior`
axes, but `scrollBehavior` is broken:

- **`scrollBehavior="inside"` does not scroll — content overflows.** The `content` slot is
  `display: grid` with no row template, and the `body` slot is `flex-1` (inert inside a grid) +
  `overflow-y-auto`. The body has no bounded height and no `min-height: 0`, so `overflow-y-auto` never
  engages and the card overruns its `max-h`.
- **`scrollBehavior="outside"` is implemented wrong.** It puts `max-h + overflow-y-auto` on the Content
  card itself (the card scrolls its own overflow). The intended behavior — matching Base UI / Ark /
  Chakra, the libraries this project is API-inspired by — is that a dedicated **`Dialog.Positioner`**
  element wraps the Content, is `position: fixed` over the viewport, and is the **scroll container**:
  for `outside` the Positioner scrolls (you scroll past the whole card within the viewport) while the
  card keeps its natural height. There is **no Positioner today** — positioning is CSS directly on the
  fixed Content card (`packages/presets/src/hope/recipes/dialog.ts`, the `placement`/`size` variants).

**Outcome:** introduce a required `Dialog.Positioner` structural part (`Portal > Backdrop + Positioner
> Content`), move all positioning onto it, fix the flexbox scroll mechanics, and make `outside` scroll
the Positioner. Reference implementation cross-checked against Chakra's Panda `dialog` slot recipe
(`packages/panda-preset/src/slot-recipes/dialog.ts`).

## Why no primitives change

The Positioner is presentational (like Header/Body/Footer) plus presence — no headless behavior. And
`createHideOutside` already spares an ancestor of its target (the TreeWalker `FILTER_SKIP`s ancestors
of the target and `REJECT`s the spared `ModalBackdrop`/`Backdrop` siblings — see
`create-hide-outside.ts`), so nesting Content one level deeper inside the Positioner is safe with **no**
spare-registration. `createDialog` (root) also doesn't need to know about a Positioner — it's a
purely presentational grouping. Keeping the change out of the kernel means no new primitive
test/`.md`, and `check:coverage-parity` stays green (a new part file in an existing component folder
adds no per-folder burden).

The one non-obvious part is **presence timing** (see the Positioner component below).

## Changes

### 1. Theming contract — `packages/theming/src/recipes/dialog.ts`
- Add `"positioner"` to the `DialogSlot` union and mention it in the slot doc comment.
- Test `packages/theming/src/recipes/__tests__/dialog.test.ts` — add `"positioner"` to the `slots`
  array and bump `toHaveLength(8)` → `9`.

### 2. Preset recipe — `packages/presets/src/hope/recipes/dialog.ts`
Replace slots + variants with the "Final recipe" below. Update the header comment (positioning now
lives on `positioner`; `size`'s `cover`/`full` override the positioner padding rather than content
`inset-*`). Purity preserved (layout-only; same finished `--hope-*` tokens).

### 3. Preset recipe test — `packages/presets/src/hope/recipes/__tests__/dialog.test.ts`
Add `"positioner"` to `SLOTS`. Rewrite the assertions that pin old class locations:
- "renders the content as a fixed card" → `positioner()` has `fixed`/`inset-0`/`flex`; `content()` has
  `relative flex flex-col` (not `fixed`), keeping the `bg-surface-overlay`/`border-subtle`/`rounded-xl`/
  `shadow-lg`/transition/`data-entering|exiting` checks.
- "centers by default / top" → `placement:"center"` puts `my-auto` on `content()`; positioner base has
  `items-start justify-center`; `placement:"top"` puts `sm:pt-16` on `positioner()`, content has **no**
  `my-auto`.
- "cover" → `positioner()` has `sm:p-8`; `content()` has `h-full max-w-none my-0`, keeps `rounded-xl`.
- "full" → `positioner()` has `p-0`; `content()` has `h-full max-w-none rounded-none my-0`.
- "inside" → `positioner()` has `overflow-hidden`; `content()` has `max-h-full`; `body()` has `overflow-y-auto`.
- "outside" → `positioner()` has `overflow-y-auto`; `content()` has **no** `max-h`/`overflow`; `body()` has no `overflow-y-auto`.
- "defaults" → content `sm:max-w-lg` + `my-auto` + `max-h-full`; positioner `overflow-hidden`; body `overflow-y-auto`.

### 4. Components — `packages/components/src/dialog/`

**`dialog-context.ts`** — add to `DialogContextValue`:
```ts
/** The Content element, published by Dialog.Content so Dialog.Positioner can time its exit. */
contentElement: Accessor<HTMLElement | undefined>;
setContentElement: (el: HTMLElement | undefined) => void;
```

**`dialog-root.tsx`** — create `const [contentElement, setContentElement] = createSignal<HTMLElement>()`
and add both to the context object. No other change.

**`dialog-content.tsx`** — publish its element by composing the ref: change `ref: content.setRef` to
`ref: (el) => { content.setRef(el); ctx.setContentElement(el ?? undefined); }`. No other change (the
`relative`/`flex-col` chrome comes from the recipe).

**`dialog-positioner.tsx`** (NEW — mirror Body/Header, plus presence):
```tsx
import { createPresence } from "@hope-ui/primitives/internal";
import { type RenderProp, renderElement } from "@hope-ui/primitives/utils";
import { cx } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit, Show } from "solid-js";
import { useDialogContext } from "./dialog-context";

export interface DialogPositionerProps extends JSX.HTMLAttributes<HTMLDivElement> {
  render?: RenderProp<JSX.HTMLAttributes<HTMLDivElement>>;
}

// The fixed, full-viewport scroll container that centers/positions the Content card. Required wrapper:
// Portal > Backdrop + Positioner > Content. Because it is `fixed inset-0`, it unmounts when closed (an
// empty full-viewport wrapper would block the page). Its presence is timed off the Content element
// (published on context), NOT its own — the Positioner has no transition of its own, so a self-timed
// createPresence would report exit-done immediately and cut the Content's exit animation short.
export const Positioner: Component<DialogPositionerProps> = (props) => {
  const ctx = useDialogContext();
  const presence = createPresence({ present: ctx.open, ref: ctx.contentElement });

  const elementProps = merge(omit(props, "render", "class"), {
    get class(): string {
      return cx(ctx.slots.positioner(), props.class) ?? "";
    },
    "data-slot": "dialog-positioner",
    get "data-presence"(): string {
      return presence.status();
    },
  });

  return (
    <Show when={presence.mounted()}>
      {renderElement<JSX.HTMLAttributes<HTMLDivElement>, HTMLDivElement>({
        as: "div",
        render: props.render,
        props: elementProps,
      })}
    </Show>
  );
};
```
Ordering is safe: presence reads the content ref only on the exit edge (untracked). The Positioner
mounts first (`present` true), then renders Content, which publishes its element before any close.

**`index.ts`** — import `Positioner`, add it to the `Dialog` namespace (between `Backdrop` and
`Content`), and `export type { DialogPositionerProps }`.

### 5. Stories — `packages/components/src/dialog/dialog.stories.tsx`
Wrap `<Dialog.Content>` in `<Dialog.Positioner>` in all four dialog trees (`DialogDemo`, `AlertDialog`,
`WithForm`, `NonDismissible`). Update the `ScrollOutside` description to note the Positioner is the
scroll container.

### 6. Tests — `packages/components/src/dialog/__tests__/`

**`dialog.ssr-entry.tsx`** — wrap `<Dialog.Content>` in `<Dialog.Positioner>` in `Tree`. The Positioner
is inside `Dialog.Portal` (client-only), so the server output stays "just the trigger" and the
trigger's `_hk` is unchanged (a component inserted *after* the trigger doesn't shift its key). The
inline snapshot in `dialog.ssr.test.tsx` should be unchanged; regenerate with
`pnpm exec vitest run --project=ssr -u` to confirm.

**`dialog.browser.test.tsx`** — wrap every `<Dialog.Content>` in `<Dialog.Positioner>` (in `FullDialog`,
the inline helpers, and each inline tree). **Keep** the existing inline `style={{ position: ... }}` on
`Content` — there is no Tailwind in the browser project, so the recipe positioning has no CSS and
Content must stay inline-positioned to paint above `ModalBackdrop`; the Positioner is an unstyled
static wrapper there and doesn't affect hit-testing. Add `"dialog-positioner"` to the expected
data-slots in the "marks each styled part with its data-slot" test.

## Final recipe (`dialogRecipe`)

```ts
slots: {
  backdrop: [ /* UNCHANGED */
    "fixed inset-0 z-50 bg-scrim supports-[backdrop-filter]:backdrop-blur-xs",
    "transition-opacity duration-200 ease-out motion-reduce:transition-none",
    "data-entering:opacity-0 data-exiting:opacity-0",
  ],
  // NEW: fixed full-viewport flex frame; the viewport scroll container (overflow set per scrollBehavior).
  positioner: "fixed inset-0 z-50 flex items-start justify-center overscroll-contain p-4 sm:p-6",
  // REWORKED: flow child (relative, not fixed — relative anchors the absolute closeTrigger to the card),
  // flex-col (the inside-scroll fix), no placement/translate/mobile-max-w. Card chrome + transitions kept.
  content: [
    "relative flex w-full flex-col gap-4 rounded-xl border border-subtle bg-surface-overlay p-4",
    "text-sm text-foreground shadow-lg outline-none",
    "transition-[opacity,scale] duration-200 ease-out motion-reduce:transition-none",
    "data-entering:opacity-0 data-entering:scale-95 data-exiting:opacity-0 data-exiting:scale-95",
  ],
  header: "flex shrink-0 flex-col gap-2",          // shrink-0 so only the body absorbs the height cap
  body: "min-h-0 flex-1",                          // min-h-0 lets the flex item shrink so overflow can scroll
  footer: [
    "-mx-4 -mb-4 flex shrink-0 flex-col-reverse gap-2 rounded-b-xl border-t border-subtle bg-surface-sunken p-4",
    "sm:flex-row sm:justify-end",
  ],
  title: "text-base font-medium leading-none text-foreground",
  description: [
    "text-sm text-foreground-muted",
    "[&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-foreground",
  ],
  closeTrigger: "absolute end-2 top-2",            // anchors to the now-`relative` content card
},
// Order stays placement -> scrollBehavior -> size so `size` (esp. cover/full) wins.
variants: {
  placement: {
    center: { content: "my-auto" },               // auto margins: center when it fits, collapse to 0 (top-reachable) when tall
    top: { positioner: "sm:pt-16" },               // top-anchored via items-start; base p-4 is the mobile top gutter
  },
  scrollBehavior: {
    inside: { positioner: "overflow-hidden", content: "max-h-full", body: "overflow-y-auto" },
    outside: { positioner: "overflow-y-auto" },    // the Positioner scrolls; content keeps natural height
  },
  size: {
    xs: { content: "sm:max-w-xs" },
    sm: { content: "sm:max-w-sm" },
    md: { content: "sm:max-w-lg" },
    lg: { content: "sm:max-w-xl" },
    xl: { content: "sm:max-w-2xl" },
    cover: { positioner: "sm:p-8", content: "h-full max-w-none my-0", body: "overflow-y-auto" },
    full: { positioner: "p-0 sm:p-0", content: "h-full max-w-none rounded-none my-0", body: "overflow-y-auto" },
  },
},
defaultVariants: { size: "md", placement: "center", scrollBehavior: "inside" },
```

### Why this fixes both bugs (mechanics)
- **Inside scroll:** Content is now `flex flex-col` and height-capped (`max-h-full`, resolved against
  the fixed Positioner's definite content-box). `header`/`footer` are `shrink-0`; `body` is
  `flex-1 min-h-0` — `min-h-0` removes the default `min-height: auto` floor so the body can shrink
  below its content and `overflow-y-auto` produces a scrollbar. `positioner: overflow-hidden` so it
  can't double-scroll.
- **Outside scroll:** `positioner: overflow-y-auto` makes the fixed frame the scroll container;
  Content keeps natural height. `placement:center`'s `my-auto` centers a short card but collapses to
  `0` when the card is taller than the viewport (flexbox spec), so it anchors to the top and the whole
  card is reachable — no top-clip (the classic `align-items:center` / `justify-content:center` +
  overflow bug this avoids).

### tailwind-merge sanity (declared order placement → scrollBehavior → size, last wins)
- `my-auto` (center) vs `my-0` (cover/full): same `my` group, `size` last → `my-0` wins for cover/full.
- `sm:pt-16` (top) vs `sm:p-0` (full): `full` last → `sm:p-0` removes the `pt` for full+top (edge-to-edge wins).
- `h-full` (size) and `max-h-full` (inside) are **different** groups, so both survive; in cover/full both
  equal 100% of a definite box, so no clip.
- base positioner has **no** `overflow`; `scrollBehavior` owns it entirely (avoids an
  `overflow`/`overflow-y` cross-group collision).

## Verification

1. `pnpm --filter @hope-ui/theming typecheck && pnpm --filter @hope-ui/components typecheck`.
2. `pnpm test` — theming contract length + preset recipe assertions.
3. `pnpm exec vitest run --project=ssr packages/components/src/dialog` — SSR round-trip; `-u` if the
   trigger key shifted (it should not).
4. `pnpm test:browser packages/components/src/dialog/__tests__/dialog.browser.test.tsx` — hydration,
   dismissal, focus, data-slots, a11y (`expectNoA11yViolations`).
5. `pnpm check:recipe-purity && pnpm check:coverage-parity` — both stay green (no new primitive files).
6. `pnpm storybook` → **Components/Dialog**, confirm by eye:
   - `scrollBehavior='inside'` (long body): header/footer pinned, **body scrolls**, card capped (no overflow).
   - `scrollBehavior='outside'` (long body): whole card scrolls within the viewport; short card centered,
     tall card top-reachable.
   - `Sizes` (esp. `cover`/`full`) and `placement='top'` still render correctly.
   - Open/close still animates (zoom+fade both ways) — confirms the Positioner presence outlives the
     Content exit.
