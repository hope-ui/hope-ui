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
 * The group-label part: names its `Group` by registering its `id` on the group's `aria-labelledby`.
 * `createRegisteredId` is what defers that write, because Solid 2.0 forbids a descendant writing an
 * ancestor-owned signal from its render body. Call it from the label's own owner scope, so the
 * registration is cleaned up when the label unmounts.
 */
export function createListboxGroupLabel(
  group: CreateListboxGroupReturn,
  props: JSX.HTMLAttributes<HTMLElement> = {},
): CreateListboxGroupLabelReturn {
  // `withDefaults` keeps the resolved `id` reactive on the props object it returns, which is what the
  // registration below reads. Falling back to the generated id is load-bearing: without one the group
  // gets no `aria-labelledby` and no accessible name at all.
  const generatedId = createUniqueId();
  const merged = withDefaults(props, { id: generatedId });

  createRegisteredId({ id: () => merged.id, register: group.setLabelId });

  return { props: merged };
}
