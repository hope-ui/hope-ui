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

Peer dependencies: `solid-js` and `@solidjs/web` (`2.0.0-beta.x`), plus `@tanstack/virtual-core` as
an **optional** peer (only `createVirtualCollection` needs it, so the kernel stays zero-cost for
consumers who never virtualize). Bundled dependencies: `@internationalized/date` (the calendar
substrate) and `@solid-primitives/a11y` (the live-region announcer).

## Subpath exports

Only top-level `src/` folders carry a barrel and a subpath — nothing deeper.

| Import | Contents |
| ------ | -------- |
| `@hope-ui/primitives/utils` | Non-`createX` composition helpers: `renderElement` (the `render`/`as` polymorphism primitive + ref merging), `withDefaults` (the correct way to apply defaults under 2.0), `composeEventHandlers`, `createKeyboardHandler`, `runIfFunction`, `compareByIdOrReference`. |
| `@hope-ui/primitives/internal` | The `createX` behavior primitives: `createComponentContext`, `createControllableState`, `createPresence`, `createFocusTrap`, `createFocusRestore`, `createHideOutside`, `createDismissable`, `createScrollLock`, `createRegisteredId`, `createRegisteredElement`, plus the list/grid/collection navigation family (`createCollection`, `createVirtualCollection`, `createListFocus`, `createListNavigation`, `createListSelection`, `createListTypeahead`, `createListExpansion`, `createGridNavigation`). |
| `@hope-ui/primitives/dialog` | The `createDialog` hook family (root state + one hook per part). |
| `@hope-ui/primitives/calendar` | The `createCalendar` hook family (headless month/year/decade calendar, built on `@internationalized/date`). |
| `@hope-ui/primitives/modal-backdrop` | `ModalBackdrop` — the kernel's only DOM-rendering component, the pointer-blocking third of modality. |
| `@hope-ui/primitives/i18n` | Locale + reading-direction context: `I18nProvider`, `useLocale`, `createDefaultLocale`, `getReadingDirection`, and message translation. |

## Usage

`renderElement` is the polymorphism + ref-merging primitive every public component routes its
`as`/`render` surface through (modeled on Base UI's `useRender` idea, not its code):

```tsx
import { renderElement, withDefaults } from "@hope-ui/primitives/utils";

function Separator(rawProps) {
  const props = withDefaults(rawProps, { orientation: "horizontal" });
  return renderElement("div", props, {
    role: "separator",
    "aria-orientation": props.orientation,
  });
}
```

Behavior primitives return state + spreadable props; the `createDialog` family, for example,
decomposes into a root state hook plus one hook per part, so `@hope-ui/components`' `Dialog` is a
thin JSX layer over it:

```ts
import { createDialog, createDialogPopup } from "@hope-ui/primitives/dialog";

const state = createDialog({ modal: true });      // call once, in an owner scope
const popup = createDialogPopup(state, props);     // owns the focus-trap/dismiss/scroll-lock stack
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
composed families (`dialog`, `calendar`, `i18n`, `modal-backdrop`) and `utils/` helpers each carry a
usage `.md`; the `internal/` behavior primitives require a test but not a consumer-facing doc.
Architecture rationale: [`__internal__/plan.md`](../../__internal__/plan.md).

## License

MIT.
