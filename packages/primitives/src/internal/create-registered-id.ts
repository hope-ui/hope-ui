import { type Accessor, onSettled } from "solid-js";

export interface CreateRegisteredIdOptions {
  /**
   * The id to publish. `false` and `undefined` both register nothing: Solid's renderer treats
   * `false` as "omit this attribute", so it types every `id` prop as `string | false | undefined`.
   */
  id: Accessor<string | false | undefined>;
  /** Receives the id once mounted, and `undefined` on cleanup. */
  register: (id: string | undefined) => void;
}

/**
 * Publishes a descendant's `id` into an ancestor's context, so the ancestor can point an ARIA
 * relationship (`aria-labelledby`, `aria-describedby`, `aria-controls`, …) at an element it does not
 * own.
 *
 * The deferral is the whole primitive. SolidJS 2.0 throws `[REACTIVE_WRITE_IN_OWNED_SCOPE]` when a
 * descendant writes, from its own synchronous render body, to a signal an ancestor's reactive scope
 * owns — which is exactly what "register my id with my parent" is. `onSettled` runs the write after
 * mount, outside that call stack. The naive `context.setTitleId(id)` in the body reads fine and
 * passes a trivial test, which is why this is a primitive and not a snippet.
 *
 * `onSettled` does not run on the server, so nothing registers there. A component whose
 * server-rendered markup must already carry the linked attribute needs its own server-visible
 * fallback id (`Dialog.Root`'s generated `popupId`); one that only ever renders inside a `Portal`
 * emits no server markup to disagree with, so hydration is safe either way. The id is read once,
 * after mount — ARIA-linking ids are generated or pinned, never animated.
 */
export function createRegisteredId(options: CreateRegisteredIdOptions): void {
  onSettled(() => {
    const id = options.id();
    options.register(typeof id === "string" ? id : undefined);
    return () => options.register(undefined);
  });
}
