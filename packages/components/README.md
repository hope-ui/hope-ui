# @hope-ui/components

The public, themeable, accessible components of [hope-ui](../../README.md) for **SolidJS 2.0**. This
is the product: components that look right out of the box under the default
[`@hope-ui/presets/hope`](../presets/README.md) preset, styled with Tailwind v4 +
`tailwind-variants`. Each component is a thin JSX layer over the headless
[`@hope-ui/primitives`](../primitives/README.md) behavior kernel, computing its per-slot `class`
from a recipe read through [`@hope-ui/theming`](../theming/README.md).

Most apps consume this package. If you need behavior without hope-ui's styling, reach for
`@hope-ui/primitives` directly (an advanced escape hatch, not the primary path).

## Install

> Not yet published — see the repo [status](../../README.md#status).

```bash
pnpm add @hope-ui/components @hope-ui/theming @hope-ui/presets
```

Peer dependencies: `solid-js` and `@solidjs/web` (both `2.0.0-beta.x`). Runtime dependencies on the
sibling `@hope-ui/primitives` and `@hope-ui/theming` packages are carried for you.

## Subpath exports

There is **no root `.` export** — always import a specific component's subpath. Each subpath is its
own build entry, so importing one component never pulls in another's code (`"sideEffects": false`
keeps it tree-shakable).

| Import | Component |
| ------ | --------- |
| `@hope-ui/components/button` | `Button` (+ `ButtonProps` and its variant vocabulary) |
| `@hope-ui/components/dialog` | `Dialog` compound (`Dialog.Root`, `Dialog.Trigger`, `Dialog.Portal`, `Dialog.Backdrop`, `Dialog.Content`, `Dialog.Title`, `Dialog.Description`, `Dialog.CloseTrigger`) |
| `@hope-ui/components/calendar` | `Calendar` compound |

## Usage

Wire the default preset once at the app root — import its Tailwind CSS entry into your Tailwind v4
entry, and provide the preset object to `<ThemeProvider>`:

```css
/* your Tailwind entry, e.g. app.css */
@import "tailwindcss";
@import "@hope-ui/presets/hope/tailwind.css";
```

```tsx
import { ThemeProvider } from "@hope-ui/theming";
import { hope } from "@hope-ui/presets/hope";
import { Button } from "@hope-ui/components/button";

<ThemeProvider preset={hope}>
  <Button colorScheme="danger" variant="soft">
    Delete
  </Button>
</ThemeProvider>;
```

Compound components (Dialog) follow the parts model — every part except `Root` accepts a `render`
prop for polymorphism, and open state is uncontrolled by default (`defaultOpen`) or controlled with
`open`/`onOpenChange`:

```tsx
import { Dialog } from "@hope-ui/components/dialog";

<Dialog.Root>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Backdrop />
    <Dialog.Content class="fixed inset-0 m-auto h-fit w-fit">
      <Dialog.Title>Confirm</Dialog.Title>
      <Dialog.Description>This can't be undone.</Dialog.Description>
      <Dialog.CloseTrigger />
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>;
```

A modal `Dialog.Content` must be positioned (`fixed`/`absolute`/`relative`), or it paints beneath the
pointer-blocking backdrop — see the Dialog page in the doc website (`apps/docs/`).

## Polymorphism: `render`, not `as`

hope-ui deliberately avoids a generic `Polymorphic<T>`/`as`-prop type system. Components expose a
function-only `render` prop wired through the kernel's `renderElement`, which also owns ref merging.
`Button` additionally takes `nativeButton={false}` to switch to a `role="button"` accessibility
model when you render a non-`<button>` element:

```tsx
<Button render={(props) => <a href="/next" {...props} />} nativeButton={false}>
  Continue
</Button>
```

## Composition rules

- Compose behavior from `@hope-ui/primitives`; compute styling through `@hope-ui/theming`
  (`useRecipe`/`useSlots`/`useDefaults`). A component never declares its own recipe contract — the
  `RecipeRegistry` in theming is the single source of truth (no module augmentation).
- **You may reuse a sibling component** (e.g. `Dialog.CloseTrigger` renders `@hope-ui/components/close-button`) —
  a reusable leaf shouldn't be re-implemented; sibling subpaths stay external in the build, so reuse is
  deduped. Two limits: no **circular** imports, and don't wire a component's *behavior* through a heavier
  sibling — Popover composes the shared kernel (`createFloating`/`createDismissable`/…) directly rather
  than depending on Dialog's modal machinery. See [`__internal__/plan.md`](../../__internal__/plan.md).

## Docs

- Per-component API, keyboard tables, and ARIA references: the doc website (`apps/docs/`).
- Theming model and semantic tokens: [`__internal__/theming.md`](../../__internal__/theming.md).
- Component backlog and complexity tiers: [`__internal__/roadmap.md`](../../__internal__/roadmap.md).

## License

MIT.
