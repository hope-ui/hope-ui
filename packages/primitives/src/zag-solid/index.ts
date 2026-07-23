/**
 * A vendored fork of `@zag-js/solid@1.42.0` (`chakra-ui/zag`, `packages/frameworks/solid`, MIT),
 * migrated to SolidJS 2.0. **Temporary**: the official adapter targets Solid 1.x, and this
 * subpath exists only until upstream ships a 2.0-compatible release, at which point it is
 * deleted and `@zag-js/solid` is installed in its place. So it is a *minimal-diff* fork —
 * upstream's file layout and public API are preserved verbatim, and only what Solid 2.0 forces
 * was changed:
 *
 * - `Key` (from `@solid-primitives/keyed`) is **not** re-exported. It is an uninstalled community
 *   control-flow component used only at component-render time, and no Zag component is ported yet.
 * - `onMount` → `onSettled` (`machine`, `use-sync-external-store`), which takes a *returned*
 *   teardown rather than an inner `onCleanup`.
 * - `mergeProps` → `merge` (`machine`). Both call sites only add method keys, so `merge`'s
 *   presence-based key resolution is equivalent there.
 * - Single-argument `createEffect` → the split `(compute, effect)` pair (`track`, `bindable`);
 *   2.0 rejects the one-argument form outright. `track` additionally runs its callback `untrack`ed,
 *   because machines read `prop(...)` inside it and 2.0's effect phase is strict-read-labelled.
 * - `bindable`'s signal is **boxed** (`{ value: T }` + an unwrapping `equals`), because 2.0's
 *   `createSignal(fn)` is the memo overload and would invoke a function-valued state instead of
 *   storing it. `use-sync-external-store`'s snapshot is boxed for the same reason.
 * - `flush` is Solid 2.0's real `flush`, not upstream's no-op. Solid 1.x propagated writes
 *   synchronously; 2.0's client build defers them to the next flush, so the machine's state write
 *   is drained at the call site — the same thing the React adapter does with `flushSync`.
 * - `JSX` types come from `@solidjs/web` (2.0's DOM package, and this repo's `jsxImportSource`).
 * - `normalizeProps` **stringifies boolean `aria-*` values** — the fork's one bug fix rather than a
 *   migration. Solid's `setAttribute` writes `true` as `""` and removes the attribute for `false`,
 *   so Zag's boolean ARIA state shipped as `aria-modal=""` or as nothing at all. Upstream has the
 *   same bug (React stringifies `aria-*`, so it never surfaces there).
 *
 * See `__internal__/primitives/zag-solid/machine.md`.
 */
export * from "./machine";
export { mergeProps } from "./merge-props";
export * from "./normalize-props";
export * from "./use-sync-external-store";
