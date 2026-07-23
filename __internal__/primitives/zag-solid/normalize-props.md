# `normalizeProps`

Translates the framework-neutral props a Zag machine's connect layer emits into the spelling
SolidJS expects. Every Zag component part is written as
`<button {...normalizeProps.element(api.getTriggerProps())} />`.

Part of the vendored `@zag-js/solid@1.42.0` fork — read `machine.md` first. The only Solid 2.0
change is the import of the `JSX` types: `@solidjs/web`, not `solid-js`.

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

Plus three rules that are not renames:

- **`readOnly={false}` is dropped entirely.** Solid reflects `readonly=""` for any present value,
  so forwarding the `false` would mark the element read-only.
- **A `style` object is hyphenated** (`marginTop` → `margin-top`, `msOverflowStyle` →
  `-ms-overflow-style`), custom properties (`--x`) pass through untouched, and any value that is
  neither a string nor a number is dropped. A `style` *string* is left alone.
- **`children` becomes `textContent`** when it is a string, and is dropped otherwise — Zag never
  passes real Solid children through here.

Everything else passes through unchanged, `undefined` values included.
