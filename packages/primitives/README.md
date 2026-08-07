# @hope-ui/primitives

The headless **behavior kernel** underneath [hope-ui](../../README.md): composable SolidJS 2.0
primitives for rendering/polymorphism, focus management, dismissal, presence, collection & keyboard
navigation, modality, and ARIA wiring. Everything else in the workspace composes it —
[`@hope-ui/theming`](../theming/README.md) (for `createComponentContext`) and every
[`@hope-ui/components`](../components/README.md) subpath.

> **Internal / advanced escape hatch — not a stability-promised public API.** The kernel is shipped
> so advanced consumers can build components hope-ui doesn't, but its signatures may churn between
> minors; themeable components are the marketed path, not headless composition. Treat these subpaths as
> unstable.

If a **true headless library** is what you're after — a stable, styling-agnostic API to build your
own components on — reach for [Kobalte](https://github.com/kobaltedev/kobalte) instead. It's a
mature, accessibility-first headless UI kit for SolidJS, and that's exactly the experience this
kernel is *not* trying to provide.

## Install

> Not yet published — see the repo [status](../../README.md#status).

```bash
pnpm add @hope-ui/primitives
```

Peer dependencies: `solid-js` and `@solidjs/web` (`2.0.0-beta.x`), plus two **optional** peers —
`@tanstack/virtual-core` (only `createVirtualCollection` needs it) and `@floating-ui/dom` (only
`createFloating` needs it), so the kernel stays zero-cost for consumers who never virtualize a list
or open a floating layer. Bundled dependencies: `@internationalized/date` (the calendar substrate)
and `@solid-primitives/a11y` (the live-region announcer).

> **"Optional" is an npm/type-level claim, not a module-graph one.** `internal/index.ts` re-exports
> `createVirtualCollection` and `createFloating`, both of which statically import their peer, and the
> package ships unbundled — so `dist/internal/index.jsx` carries top-level imports for both. A
> consumer who skips the install fails at *resolve* time unless their bundler tree-shakes the unused
> branch, which Vite/Rollup will, given `sideEffects: false`. If you import from
> `@hope-ui/primitives/internal` under a bundler that doesn't, install both peers.

> **`@floating-ui/dom` is optional here, but not for anyone using `@hope-ui/components`'s Popover.**
> The optionality claim belongs to *this* package — it is `createFloating` that needs the peer, and a
> consumer who only opens a Dialog still pays nothing. But `@hope-ui/components/popover` positions
> every layer through `createFloating`, so installing that component means resolving the peer,
> unconditionally. `@hope-ui/components` deliberately declares no dependency on it: moving the
> declaration there would make the peer mandatory for consumers of every *other* component in the
> package, which is the larger group.

## Subpath exports

Only top-level `src/` folders carry a barrel and a subpath — nothing deeper.

| Import | Contents |
| ------ | -------- |
| `@hope-ui/primitives/render` | `renderElement` — the `render`/`as` polymorphism primitive (+ ref merging) every public component routes its parts through. |
| `@hope-ui/primitives/utils` | The remaining non-`createX` composition helpers: `withDefaults` (the correct way to apply defaults under 2.0), `composeEventHandlers`, `createKeyboardHandler`, `runIfFunction`. |
| `@hope-ui/primitives/internal` | The `createX` behavior primitives: `createComponentContext`, `createControllableState`, `createPresence`, `createAutoFocus` (initial focus **without** a trap — what a non-modal layer needs, and what `createFocusTrap` composes), `createFocusTrap`, `createFocusScope`, `createFocusRestore`, `createHideOutside` (+ `createKeepVisible`), `createDismissable`, `createScrollLock`, `createFloating` (overlay positioning, over `@floating-ui/dom`), `createPress`, `createButton`, `createTextInput` (IME-safe controlled value + caret preservation), `createRegisteredId`, `createRegisteredElement`, `createTextDirectionWarning`, `scrollIntoView`, plus the list/grid/collection navigation family (`createCollection`, `createDataCollection`, `createVirtualCollection`, `createListFocus`, `createListNavigation`, `createListSelection`, `createListTypeahead`, `createListExpansion`, `createGridNavigation`). |
| `@hope-ui/primitives/dialog` | The `createDialog` hook family (root state + one hook per part). |
| `@hope-ui/primitives/popover` | The `createPopover` hook family (root state + trigger/anchor/positioner/content/arrow/title/description/close-trigger hooks) — a **non-modal** floating layer composed from `createFloating` + `createDismissable` + `createAutoFocus` + `createFocusRestore` + `createPresence`, never Dialog's modal machinery. |
| `@hope-ui/primitives/listbox` | The `createListbox` hook family (root state + item/group/group-label/separator hooks) — composes the `internal/` list kernel; collection + virtual source modes, roving + activedescendant focus. |
| `@hope-ui/primitives/combobox` | The `createCombobox` hook family (root state + input/trigger/toggle/clear/list/content/positioner/value/status hooks) — the shared half of Select and Combobox, named after the ARIA pattern and **input-agnostic by construction**: it never owns a text value, which is what lets Select compose it. |
| `@hope-ui/primitives/calendar` | The `createCalendar` hook family (headless month/year/decade calendar, built on `@internationalized/date`). |
| `@hope-ui/primitives/modal-backdrop` | `ModalBackdrop` — the pointer-blocking third of modality. |
| `@hope-ui/primitives/hidden-select` | `HiddenSelect` + `createHiddenSelect` — the clipped native `<select>` that buys Listbox and Select real form submission: autofill, a working `required`, and form reset. |

> Locale + reading-direction context (`I18nProvider`, `useLocale`, `getReadingDirection`, message
> translation) now lives in its own standalone package, **`@hope-ui/i18n`** — the kernel's calendar
> depends on it. It was lifted out of here so it can be a stable public layer rather than an
> unstable-escape-hatch subpath.

## Usage

`renderElement` is the polymorphism + ref-merging primitive every public component routes its
`as`/`render` surface through (modeled on Base UI's `useRender` idea, not its code):

```tsx
import { renderElement } from "@hope-ui/primitives/render";
import { withDefaults } from "@hope-ui/primitives/utils";
import { merge, omit } from "solid-js";

function Separator(rawProps) {
  const merged = withDefaults(rawProps, { orientation: "horizontal" });
  return renderElement({
    as: "div",
    render: merged.render,
    props: merge(omit(merged, "render", "orientation"), {
      role: "separator",
      get "aria-orientation"() {
        return merged.orientation;
      },
    }),
  });
}
```

Behavior primitives return state + spreadable props; the `createDialog` family, for example,
decomposes into a root state hook plus one hook per part, so `@hope-ui/components`' `Dialog` is a
thin JSX layer over it:

```ts
import { createDialog, createDialogContent } from "@hope-ui/primitives/dialog";

const state = createDialog({ modal: true });        // call once, in an owner scope
const content = createDialogContent(state, props);  // owns the focus-trap/dismiss/scroll-lock stack
```

## Design notes worth knowing

- **Modality is four mechanisms, not one.** `createHideOutside` applies `aria-hidden` **and**
  `inert` outside the popup; `createFocusTrap` cycles Tab inside it; `ModalBackdrop` blocks the
  pointer unconditionally. None is redundant — see [`CLAUDE.md`](../../CLAUDE.md) and the
  [`modal-backdrop` usage doc](../../__internal__/primitives/modal-backdrop/modal-backdrop.md).
- **No primitive keeps cross-instance state at module scope.** `createScrollLock` and
  `createHideOutside` key their ref counts off `document.body`/the element under a `Symbol.for(...)`,
  which resolves through the cross-realm global symbol registry, so two installed copies read the
  same slot.
- **SolidJS 2.0 idioms are load-bearing.** Split `createEffect(depsFn, computeFn)`, `merge`/`omit`
  (not `mergeProps`/`splitProps`), `onSettled` (not `onMount`), `withDefaults` (not `merge`) for
  defaults. See [`__internal__/solid-2.0-notes.md`](../../__internal__/solid-2.0-notes.md).

## Reference / composition policy

Base UI and React Aria are active behavior references (public API + a11y reasoning, not their React
internals). `@solid-primitives` (the `next` branch) is adopted as a dependency where it fits, gated
on the full Definition of Done — above all the hydration round-trip. Do **not** copy code from other
Solid headless libraries. See [`__internal__/reference-implementations.md`](../../__internal__/reference-implementations.md)
and [`__internal__/solid-primitives-eval.md`](../../__internal__/solid-primitives-eval.md).

## Docs

Per-primitive usage docs live under [`__internal__/primitives/`](../../__internal__/primitives/). The
composed families (`dialog`, `calendar`, `listbox`, `combobox`, `popover`, `hidden-select`,
`modal-backdrop`), `render/` and the `utils/` helpers each carry a usage `.md`; the `internal/`
behavior primitives require a test but not a consumer-facing doc. Locale docs live one level up, in
[`__internal__/i18n/`](../../__internal__/i18n/), since i18n is its own package.
Architecture rationale: [`__internal__/plan.md`](../../__internal__/plan.md).

## License

MIT.
