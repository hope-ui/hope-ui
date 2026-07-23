import { isEqual, isFunction } from "@zag-js/utils";
import { createEffect } from "solid-js";

function access<T>(v: T | (() => T)): T {
  if (isFunction(v)) {
    return v();
  }
  return v;
}

/**
 * Re-runs `effect` whenever one of `deps` changes by deep equality — the `track` a Zag machine
 * receives in its params.
 *
 * Upstream latches the first run with an `isFirstRun` flag inside a single-argument
 * `createEffect`. Solid 2.0 rejects that form (`[MISSING_EFFECT_FN]`) and requires the split
 * `(compute, effect)` pair, whose effect callback is handed the previous compute value —
 * `undefined` on the first run. So the latch is the framework's, not ours: the snapshot is what
 * the compute returns (and the only thing that tracks), and the comparison is the effect's.
 */
export const createTrack = (deps: any[], effect: VoidFunction) => {
  createEffect(
    () => deps.map((dep) => access(dep)),
    (current, previous) => {
      if (previous === undefined) {
        return;
      }
      const changed = current.some((value, index) => !isEqual(value, previous[index]));
      if (changed) {
        effect();
      }
    },
  );
};
