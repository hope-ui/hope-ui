# `normalizeProps`

Translates the framework-neutral props a Zag machine's connect layer emits into the spelling
SolidJS expects. Every Zag component part is written as
`<button {...normalizeProps.element(api.getTriggerProps())} />`.

Part of the vendored `@zag-js/solid@1.42.0` fork — read `machine.md` first. The only Solid 2.0
change is the import of the `JSX` types: `@solidjs/web`, not `solid-js`. It also carries the fork's
single **bug fix** (the boolean-`aria-*` rule below), which is a deviation from upstream rather than
a migration.

## API

```ts
type PropTypes = JSX.IntrinsicElements & {
  element: JSX.HTMLAttributes<any>;
  style: JSX.CSSProperties;
};

const normalizeProps: NormalizeProps<PropTypes>;
```

`NormalizeProps` is a proxy: every key returns the same normalizer, so `normalizeProps.element`,
`normalizeProps.button` and `normalizeProps.input` are interchangeable at runtime and differ only
in the type they produce.

## What it rewrites

| In (Zag / React spelling) | Out (Solid) |
| ------------------------- | ----------- |
| `onFocus` / `onBlur`      | `onFocusIn` / `onFocusOut` |
| `onDoubleClick`           | `onDblClick` |
| `onChange`                | `onInput` |
| `className`               | `class` |
| `htmlFor`                 | `for` |
| `defaultChecked` / `defaultValue` | `checked` / `value` |

Plus four rules that are not renames:

- **A boolean `aria-*` value is stringified** — `aria-expanded={false}` → `"false"`,
  `aria-modal={true}` → `"true"`. **This is the one place the fork deviates from upstream to fix a
  bug rather than to migrate an API.** Zag emits ARIA state as real booleans, which is correct for
  React (its DOM layer stringifies `aria-*`); Solid's `setAttribute` is

  ```js
  value == null || value === false
    ? node.removeAttribute(name)
    : node.setAttribute(name, value === true ? "" : value);
  ```

  and the SSR serializer agrees. So without this rule an open modal ships `aria-modal=""` — not a
  valid value for an enumerated ARIA attribute, which axe reports as `aria-valid-attr-value` — and
  a collapsed trigger ships **no** `aria-expanded` at all, silently losing the state. Upstream
  `@zag-js/solid` has the same bug; nothing there is exercised against axe, so it has never
  surfaced. Non-`aria-` booleans (`data-open`, `disabled`) and non-boolean `aria-` values are left
  alone. Found while building `ZagDialog` — see `__internal__/spikes/zag-dialog-findings.md`.
- **`readOnly={false}` is dropped entirely.** Solid reflects `readonly=""` for any present value,
  so forwarding the `false` would mark the element read-only. Same class of problem as the rule
  above, and it was already in upstream.
- **A `style` object is hyphenated** (`marginTop` → `margin-top`, `msOverflowStyle` →
  `-ms-overflow-style`), custom properties (`--x`) pass through untouched, and any value that is
  neither a string nor a number is dropped. A `style` *string* is left alone.
- **`children` becomes `textContent`** when it is a string, and is dropped otherwise — Zag never
  passes real Solid children through here.

Everything else passes through unchanged, `undefined` values included.
