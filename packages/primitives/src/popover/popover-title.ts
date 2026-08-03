import type { JSX } from "@solidjs/web";
import { createUniqueId } from "solid-js";
import { createRegisteredId } from "../internal";
import { withDefaults } from "../utils";
import type { CreatePopoverReturn } from "./popover-root";

export interface CreatePopoverTitleReturn {
  /** Spread onto the title element. Carries the resolved `id` (consumer's, else generated). */
  props: JSX.HTMLAttributes<HTMLHeadingElement>;
}

/**
 * The title part: labels the popup by registering its `id` into the popup's `aria-labelledby`.
 * `createRegisteredId` defers that write, because Solid 2.0 throws when a descendant writes an
 * ancestor-owned signal during render. Call it from the title's own owner scope, so the
 * registration's cleanup is scoped to the title's unmount.
 */
export function createPopoverTitle(
  state: CreatePopoverReturn,
  props: JSX.HTMLAttributes<HTMLHeadingElement>,
): CreatePopoverTitleReturn {
  // `withDefaults`, not `props.id ?? generatedId`: an unset `id` must resolve to the generated one,
  // or the popup ends up with no `aria-labelledby` and no accessible name — which on a
  // `role="dialog"` surface is an axe `aria-dialog-name` violation, not a nicety.
  const generatedId = createUniqueId();
  const merged = withDefaults(props, { id: generatedId });

  createRegisteredId({ id: () => merged.id, register: state.setTitleId });

  return { props: merged };
}
