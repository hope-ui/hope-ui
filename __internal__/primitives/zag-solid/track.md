# `createTrack`

The `track` a Zag machine receives in its params. Re-runs a callback whenever one of its
dependencies changes by **deep** equality:

```ts
watch({ track, context, action }) {
  track([() => context.get("value")], () => action(["notify"]));
}
```

Part of the vendored `@zag-js/solid@1.42.0` fork — read `machine.md` first.

## API

```ts
const createTrack: (deps: any[], effect: VoidFunction) => void;
```

- `deps` — accessors, usually `() => context.get(key)`. A non-accessor entry is allowed and is
  simply constant.
- `effect` — run after any dep changes. **Never** on the first run.

Creates an effect, so it must be called under an owner (a machine's `watch` always is).

## Deep, not reference

Comparison is `isEqual` from `@zag-js/utils`, not Solid's reference default. A machine that tracks
an array-valued context key would otherwise re-run on every rebuild of that array, even when
nothing changed. This is why `track` exists at all instead of `createEffect`.

## The first-run latch is now the framework's

Upstream runs a single-argument `createEffect` with a manual `isFirstRun` flag and a `prevDeps`
array. SolidJS 2.0 rejects the single-argument form outright (`[MISSING_EFFECT_FN]`) and requires
the split `(compute, effect)` pair — whose effect callback is handed the **previous compute value**,
which is `undefined` on the first run.

So the latch is no longer hand-rolled:

```ts
createEffect(
  () => deps.map((dep) => access(dep)),          // the only tracking read
  (current, previous) => {
    if (previous === undefined) return;          // upstream's `isFirstRun`
    if (current.some((v, i) => !isEqual(v, previous[i]))) effect();
  },
);
```

The compute returns a fresh array each run, so it is always reference-unequal and the effect is
always notified when a dep changes; the deep comparison then decides whether to actually run.
Splitting this way also keeps every tracking read inside the compute, which is what the
`STRICT_READ_UNTRACKED` diagnostic wants.
