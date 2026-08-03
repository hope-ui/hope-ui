import type { JSX } from "@solidjs/web";
import { type Accessor, createSignal, merge } from "solid-js";
import { createPresence, createRegisteredElement } from "../internal";
import type { CreateDialogReturn } from "./dialog-root";

export interface CreateDialogBackdropReturn {
  /** Spread onto the backdrop element. `role` falls back to `"presentation"`; `data-presence` is
   * owned here. */
  props: JSX.HTMLAttributes<HTMLDivElement> & { "data-presence": string };
  /** Gate the backdrop's render on this — it stays mounted through an exit transition. */
  mounted: Accessor<boolean>;
  /** Hand to the backdrop element's `ref`; wires presence and spares it from hide-outside. */
  setRef: (element: HTMLDivElement) => void;
}

/**
 * The optional visible-backdrop part. Owns its own presence (it mounts eagerly, so it cannot hit
 * the skipped-enter-animation problem `createDialog`'s shared presence exists to avoid) and spares
 * its element from the popup's `createHideOutside`: an `inert` element is transparent to hit
 * testing, so a backdrop that let itself be marked would silently stop blocking the pointer and
 * lose its hover and pointer handlers.
 */
export function createDialogBackdrop(
  state: CreateDialogReturn,
  props: JSX.HTMLAttributes<HTMLDivElement>,
): CreateDialogBackdropReturn {
  // A signal, not a plain ref: `createPresence` reads it on the exit edge and
  // `createRegisteredElement` reacts to it, so both need to see the moment it is set.
  const [ref, setRef] = createSignal<HTMLDivElement>();

  const presence = createPresence({ present: state.open, ref });

  createRegisteredElement({
    ref,
    register: state.addSparedElement,
    unregister: state.removeSparedElement,
  });

  const elementProps = merge(props, {
    get role() {
      return props.role ?? ("presentation" as const);
    },
    get "data-presence"() {
      return presence.status();
    },
  });

  return { props: elementProps, mounted: presence.mounted, setRef };
}
