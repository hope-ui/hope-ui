# `runIfFunction`

Resolve a value-or-factory: call it if it's a function, otherwise return it as-is. The shared way
to normalize a `T | (() => T)` prop into a `T`.

## API

```ts
function runIfFunction<T>(valueOrFn: T | (() => T)): T;
```

- `valueOrFn` — either a plain `T`, or a **factory** `() => T` that produces one.
- Returns the plain value untouched, or the factory's result.

## Why a factory form exists

A component that themes a piece of **chrome content** — content it renders as part of its own design,
e.g. Button's `loader` spinner and `loadingText` message — lets a preset set that content app-wide.
A preset value is **one object shared by every instance**, and a Solid `JSX.Element` is an
already-constructed DOM node: reused across two simultaneously-rendered instances, it doesn't
duplicate — it *moves*. So a shared bare element would make two loading buttons fight over one loader
node.

A **factory** (`() => JSX.Element`) is called per instance, yielding a fresh subtree each time. This
mirrors the [`RenderProp`](../render/render.md) rule (content overrides are functions, never
already-built elements). Call `runIfFunction` **inside the instance's own reactive JSX computation**
(not once in the component body), so each consumer gets its own result:

```tsx
<Show when={isLoading()}>
  <span data-slot="button-loader">{runIfFunction(merged.loader) ?? <ButtonLoader />}</span>
</Show>
```

## Soundness caveat

The `typeof value === "function"` test only unambiguously identifies the factory when `T` itself is
**not callable**. That holds for the intended `T = JSX.Element` — `@solidjs/web`'s `type Element`
excludes function values, so a function can only be the factory. Do not use `runIfFunction` for a `T`
that can itself be a function (it would call the value instead of returning it).

## Related

- [`render`](../render/render.md) — `RenderProp`, the same "content override is a function" rule for
  full-element polymorphism.
