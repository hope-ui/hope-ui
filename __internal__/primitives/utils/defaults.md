# `withDefaults`

Applies default values to a props object. Every public component uses this instead of
`merge({ ...defaults }, props)`.

## API

```ts
function withDefaults<Props extends object, Defaults extends Partial<Props>>(
  props: Props,
  defaults: Defaults,
): WithDefaults<Props, Defaults>;
```

- `props` — the component's own props object.
- `defaults` — a partial props object. Each key is resolved as
  `props[key] ?? defaults[key]`. A `undefined` default value is meaningless; omit the key.
- Returns `props` with each defaulted key made non-optional, reads still lazy and reactive.

## Why not `merge({ ...defaults }, props)`

SolidJS 2.0's `merge` resolves a key by **presence**, not by value. A later source that has
the key *at all* wins — even when its value is `undefined`:

```ts
merge({ modal: true }, {})                  // { modal: true }   ✅ key absent
merge({ modal: true }, { modal: undefined }) // { modal: undefined } ❌ key present
```

The second case is not exotic. It is what a consumer wrapper produces the moment it
forwards an optional prop it wasn't given:

```tsx
function MyDialog(props: { modal?: boolean }) {
  // `props.modal` is `undefined` unless the caller passed it — and `modal` is now a
  // *present* key on Dialog.Root's props object.
  return <Dialog.Root modal={props.modal}>…</Dialog.Root>;
}
```

Under `merge`, `<MyDialog />` silently produced a **non-modal** dialog: no focus trap, no
scroll lock, no `aria-modal`. The same bug turned `<Button type={props.type}>` into a
form-submitting button. Both failed with no type error and no test failure.

`withDefaults` resolves with `??`, so only a present, non-nullish value overrides:

```ts
withDefaults({}, { modal: true })                  // modal: true
withDefaults({ modal: undefined }, { modal: true }) // modal: true
withDefaults({ modal: false }, { modal: true })     // modal: false  — explicit false wins
```

## Reactivity

Defaults are exposed as getters over `props`, never snapshotted. Reading a defaulted key
reads the underlying prop at that moment, inside whatever tracking scope does the reading —
so a reactive `modal` prop stays reactive. Nothing is read at call time.

## Example

```tsx
export const Button: Component<ButtonProps> = (props) => {
  const merged = withDefaults(props, { type: "button" as const });
  // merged.type is `"submit" | "reset" | "button"` — never undefined.
};
```
