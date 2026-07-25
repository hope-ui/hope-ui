import type { JSX } from "@solidjs/web";
import { createUniqueId } from "solid-js";
import { createRegisteredId } from "../internal";
import { withDefaults } from "../utils";
import type { CreatePopoverReturn } from "./popover-root";

export interface CreatePopoverDescriptionReturn {
  /** Spread onto the description element. Carries the resolved `id` (consumer's, else generated). */
  props: JSX.HTMLAttributes<HTMLParagraphElement>;
}

/**
 * The description part: describes the popup. Mirrors `createPopoverTitle` — resolves an unset `id`
 * to a generated one and registers it on the popup's `aria-describedby`. Call it from the
 * description's own owner scope.
 */
export function createPopoverDescription(
  state: CreatePopoverReturn,
  props: JSX.HTMLAttributes<HTMLParagraphElement>,
): CreatePopoverDescriptionReturn {
  const generatedId = createUniqueId();
  const merged = withDefaults(props, { id: generatedId });

  createRegisteredId({ id: () => merged.id, register: state.setDescriptionId });

  return { props: merged };
}
