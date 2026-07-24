import { isEqual, isFunction } from "@zag-js/utils";
import { createEffect, untrack } from "solid-js";

function resolveDep<T>(dep: T | (() => T)): T {
  return isFunction(dep) ? dep() : dep;
}

/**
 * Re-runs `effect` whenever one of `deps` changes by **deep** equality — the `track` a Zag machine
 * receives in its params. `deps` is the whole of the callback's reactive input, by contract.
 *
 * The split `createEffect(compute, effect)` form does the latching for free: `compute` returns the
 * dependency snapshot (and is the only tracking scope here), and `effect` receives the previous
 * snapshot, `undefined` on the first run. Upstream hand-rolls that with an `isFirstRun` flag
 * because Solid 1.x only had the single-argument form.
 *
 * `untrack(effect)` is a statement about the callback, not a workaround: machines read `prop(…)`
 * and `context.get(…)` inside it (dialog's `toggleVisibility` reads `prop("open")` to pick which
 * controlled event to send), and those reads are *already* inert — an effect's side-effect phase
 * subscribes to nothing. Solid 2.0 labels the phase strict-read and warns about exactly that
 * deadness, so spelling the intent is what tells a reviewer the reads are meant to be one-shot.
 */
export const createTrack = (deps: any[], effect: VoidFunction) => {
  createEffect(
    () => deps.map(resolveDep),
    (current, previous) => {
      if (previous === undefined) {
        return;
      }
      const changed = current.some((value, index) => !isEqual(value, previous[index]));
      if (changed) {
        untrack(effect);
      }
    },
  );
};
