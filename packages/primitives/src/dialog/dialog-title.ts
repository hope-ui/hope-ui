import type { JSX } from "@solidjs/web";
import { createUniqueId } from "solid-js";
import { createRegisteredId } from "../internal";
import { withDefaults } from "../utils";
import type { CreateDialogReturn } from "./dialog-root";

export interface CreateDialogTitleReturn {
  /** Spread onto the title element. Carries the resolved `id` (consumer's, else generated). */
  props: JSX.HTMLAttributes<HTMLHeadingElement>;
}

/**
 * The title part: labels the dialog by registering its `id` on the popup's `aria-labelledby`.
 * `createRegisteredId` defers that write, because Solid 2.0 throws when a descendant writes an
 * ancestor-owned signal from its render body. Call it from the title's own reactive scope, so the
 * registration is undone when the title unmounts.
 */
export function createDialogTitle(
  state: CreateDialogReturn,
  props: JSX.HTMLAttributes<HTMLHeadingElement>,
): CreateDialogTitleReturn {
  // `withDefaults` so the resolved id travels on the returned props too: an id registered for
  // `aria-labelledby` that never lands on the element leaves the dialog with no accessible name.
  const generatedId = createUniqueId();
  const merged = withDefaults(props, { id: generatedId });

  createRegisteredId({ id: () => merged.id, register: state.setTitleId });

  return { props: merged };
}
