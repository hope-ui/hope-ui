import type { JSX } from "@solidjs/web";
import { type Accessor, createUniqueId, merge } from "solid-js";
import { createRegisteredId, type SelectionMode } from "../internal";
import type { CreateComboboxReturn } from "./combobox-root";

export interface CreateComboboxValueReturn {
  /** Spread onto the value element. `id` falls back to a generated one; `data-placeholder` is owned here. */
  props: JSX.HTMLAttributes<HTMLElement> & { "data-placeholder": "" | undefined };
  /** Whether nothing is selected — the styling hook's reactive counterpart. */
  isPlaceholder: Accessor<boolean>;
}

/**
 * The value part: the element inside the trigger that displays the current selection, and the
 * reason the trigger can announce that selection **before** the field's label.
 *
 * It registers its id upward, and `createComboboxTrigger` prepends it to the trigger's
 * `aria-labelledby` — react-aria's `useSelect` ordering. Left to content-based naming, a screen
 * reader would read the label first and the value last, which is backwards for a field whose whole
 * purpose is the value.
 *
 * The registration is client-only (`createRegisteredId` runs in `onSettled`), so a server render
 * emits no `aria-labelledby` on the trigger and falls back to its own contents — which contain this
 * element anyway. Nothing to disagree about across hydration.
 *
 * `data-placeholder` is present-empty when nothing is selected, so a recipe styles one
 * `data-placeholder:` variant instead of the empty state needing a slot of its own.
 */
export function createComboboxValue<V = unknown, M extends SelectionMode = "single">(
  state: CreateComboboxReturn<V, M>,
  props: JSX.HTMLAttributes<HTMLElement>,
): CreateComboboxValueReturn {
  const generatedId = createUniqueId();
  const id = () => props.id ?? generatedId;

  createRegisteredId({ id, register: state.setValueId });

  // Read off the listbox's own `V[]`, not the adapted scalar: "nothing selected" is one condition in
  // both modes there, where the adapted shape spells it `null` in one and `[]` in the other.
  const isPlaceholder = () => state.list.value().length === 0;

  const elementProps = merge(props, {
    get id() {
      return id();
    },
    get "data-placeholder"() {
      return isPlaceholder() ? "" : undefined;
    },
  });

  return { props: elementProps, isPlaceholder };
}
