import type { JSX } from "@solidjs/web";
import { createUniqueId } from "solid-js";
import { createRegisteredId } from "../internal";
import { withDefaults } from "../utils";
import type { CreateListboxGroupReturn } from "./listbox-group";

export interface CreateListboxGroupLabelReturn {
  /** Spread onto the label element. Carries the resolved `id` (consumer's, else generated). `ref` omitted. */
  props: Omit<JSX.HTMLAttributes<HTMLElement>, "ref">;
}

/**
 * The group-label part: names its `Group`. Registers its `id` on the group's `aria-labelledby` via
 * `createRegisteredId` (which defers the ancestor-signal write past Solid 2.0's ban on writing an
 * ancestor-owned signal from a descendant's render body). Must be called from the label's own owner
 * scope, so the registration's cleanup is scoped to its unmount. Mirrors `createDialogTitle`.
 */
export function createListboxGroupLabel(
  group: CreateListboxGroupReturn,
  props: JSX.HTMLAttributes<HTMLElement> = {},
): CreateListboxGroupLabelReturn {
  // `withDefaults`, not `props.id ?? id`: an unset `id` must resolve to the generated one, or the
  // group ends up with no `aria-labelledby` and no accessible name.
  const generatedId = createUniqueId();
  const merged = withDefaults(props, { id: generatedId });

  createRegisteredId({ id: () => merged.id, register: group.setLabelId });

  return { props: merged };
}
