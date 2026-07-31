# Third-party notices — `@hope-ui/primitives`

`@hope-ui/primitives` is released under the MIT License (see [`LICENSE.md`](./LICENSE.md)). Portions
of this package are derived from the work listed below and remain subject to its original license.
Nothing here relicenses those portions.

## Adobe React Spectrum

- **Project:** https://github.com/adobe/react-spectrum (`@react-aria/interactions`, `@react-aria/overlays`, `@react-aria/utils`, `@react-aria/select`, `@react-aria/form`)
- **License:** Apache License, Version 2.0 — full text in [`LICENSE-APACHE-2.0.txt`](./LICENSE-APACHE-2.0.txt)
- **Copyright:** Copyright 2020 Adobe. All rights reserved. (`useFormReset.ts` and `useFormValidation.ts` carry a 2023 copyright line; each derived file's header names its own.)

The following files are derived from this work. **All of them have been modified**, and each carries
an attribution header naming its upstream source:

| File | Derived from |
| ---- | ------------ |
| `src/internal/create-press.ts` | `@react-aria/interactions` — `src/usePress.ts` — the unified pointer/touch/mouse/keyboard/virtual press model |
| `src/internal/create-hide-outside.ts` | `@react-aria/overlays` — `src/ariaHideOutside.ts` — the layer stack (including its out-of-order teardown), `keepVisible`, and the always-visible marker |
| `src/internal/create-dismissable.ts` | `@react-aria/overlays` — `src/useOverlay.ts` — the flat activation-ordered stack of visible layers, and the topmost check that gates a dismissal on it |
| `src/internal/scroll-into-view.ts` | `@react-aria/utils` — `src/scrollIntoView.ts` — the scroll-port arithmetic (border widths, `scroll-padding-*`, `scroll-margin-*`, scrollbar thickness, the RTL scrollbar side) and the `"nearest"` minimum-distance delta |
| `src/hidden-select/hidden-select.tsx` | `@react-aria/select` — `src/HiddenSelect.tsx` — the 300-option `<select>`-vs-`<input>` cutoff, the clipped visually-hidden technique (and the Safari-autofill / Firefox-`<label>` reasoning behind it), the leading placeholder `<option>`, the options-for-current-values fallback while the collection is empty, and the `required`-on-`<input type="text">` trick |
| `src/hidden-select/create-hidden-select.ts` | `@react-aria/utils` — `src/useFormReset.ts` — the form-scoped `reset` listener restoring an initial value; and `@react-aria/form` — `src/useFormValidation.ts` — the `invalid` listener that cancels the browser's error UI, with `getFirstInvalidInput` deciding whether to take focus |

The principal modifications to `create-press.ts` are re-expression for SolidJS 2.0's reactive model,
firing `onPress` from the `click` event, and a single plain-value signal surface for hydration
safety. `create-hide-outside.ts` applies `aria-hidden` and `inert` together rather than choosing
between them, spells its always-visible marker as a single `data-hope-ui-top-layer` attribute, and
keeps its ref count and layer stack on the DOM under `Symbol.for` keys so two installed copies of
this package share them. `create-dismissable.ts` keeps only the stack: its Escape is a
document-level listener rather than element-scoped keyboard props, its outside-press guard is
single-phase at `pointerdown` rather than a two-phase `pointerdown`/`click` snapshot, and its
"a target inside a layer above is not outside" clause has no upstream counterpart.
`scroll-into-view.ts` keeps only the containing-block variant (`scrollIntoViewport`, which walks
scroll parents up to the page, is deliberately absent), restructures the arithmetic into per-axis
spans, and drops the iOS/WebKit scrollbar-side branch — overlay scrollbars measure zero there, so it
was already inert. `hidden-select.tsx` carries the selection on each `<option>`'s `selected` rather
than the `<select>`'s `value` (a `value` attribute on `<select>` is inert HTML, so React's
server-side special-casing has no Solid equivalent) and syncs the live element from an effect,
renders nothing at all without a `name`, respells the visually-hidden offsets as logical properties,
and drops the `validationBehavior` split — hope-ui has only the native behavior — along with the
`autoComplete` and `label` pass-throughs. `create-hidden-select.ts` is the two listeners only: no
`setCustomValidity`, no realtime validation state, and no wrapping of `form.reset` (a React
scheduling workaround with no counterpart here). All six sets are documented inline in the files.

`@internationalized/date` is also an Adobe Apache-2.0 work. It is an ordinary npm dependency,
resolved as a bare specifier in the published output and never bundled — it ships with its own
license.

## Other references

`@floating-ui/dom` (MIT) and `@tanstack/virtual-core` (MIT) are optional peer dependencies, consumed
as published and never bundled. The kernel's list-behavior and positioning primitives were designed
against the public APIs of Angular Aria (MIT, © Google LLC), Base UI (MIT, © Material-UI SAS) and
Floating UI (MIT); no source from those projects is reproduced here. Full details, including the
per-behavior source map, are in the repository's root `NOTICE.md`.

## Trademarks

Adobe, React Spectrum, and React Aria are trademarks of Adobe. hope-ui is an independent project,
not affiliated with, sponsored by, or endorsed by Adobe.
