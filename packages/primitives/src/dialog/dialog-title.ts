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
 * The title part: labels the dialog. Registers its `id` on the popup's `aria-labelledby` via
 * `createRegisteredId` (which defers the ancestor-signal write past Solid 2.0's ban on writing
 * an ancestor-owned signal from a descendant's render body). Must be called from the title's own
 * owner scope, so the registration's cleanup is scoped to the title's unmount.
 */
export function createDialogTitle(
  state: CreateDialogReturn,
  props: JSX.HTMLAttributes<HTMLHeadingElement>,
): CreateDialogTitleReturn {
  // `withDefaults`, not `props.id ?? id`: an unset `id` must resolve to the generated one, or the
  // dialog ends up with no `aria-labelledby` and no accessible name.
  const generatedId = createUniqueId();
  const merged = withDefaults(props, { id: generatedId });

  createRegisteredId({ id: () => merged.id, register: state.setTitleId });

  return { props: merged };
}
