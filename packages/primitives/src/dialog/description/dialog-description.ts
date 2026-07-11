import type { JSX } from "@solidjs/web";
import { createUniqueId } from "solid-js";
import { createRegisteredId } from "../../internal";
import { withDefaults } from "../../utils";
import type { CreateDialogReturn } from "../root/dialog-root";

export interface CreateDialogDescriptionReturn {
  /** Spread onto the description element. Carries the resolved `id` (consumer's, else generated). */
  props: JSX.HTMLAttributes<HTMLParagraphElement>;
}

/**
 * The description part: describes the dialog. Registers its `id` on the popup's
 * `aria-describedby`, mirroring `createDialogTitle`. Call it from the description's own owner
 * scope.
 */
export function createDialogDescription(
  state: CreateDialogReturn,
  props: JSX.HTMLAttributes<HTMLParagraphElement>,
): CreateDialogDescriptionReturn {
  const generatedId = createUniqueId();
  const merged = withDefaults(props, { id: generatedId });

  createRegisteredId({ id: () => merged.id, register: state.setDescriptionId });

  return { props: merged };
}
