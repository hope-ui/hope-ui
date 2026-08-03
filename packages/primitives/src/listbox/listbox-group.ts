import type { JSX } from "@solidjs/web";
import { type Accessor, createSignal, merge } from "solid-js";

export interface CreateListboxGroupReturn {
  /** Spread onto the group element (`role="group"` + `aria-labelledby`). `ref` omitted. */
  props: Omit<JSX.HTMLAttributes<HTMLElement>, "ref">;
  /** The registered group-label id, or `undefined`. */
  labelId: Accessor<string | undefined>;
  /** Register the group's label id. Called by `createListboxGroupLabel`. */
  setLabelId: (id: string | undefined) => void;
}

/**
 * The group part: a `role="group"` wrapper that names itself from its `GroupLabel`, which registers
 * its id into the signal below. `aria-labelledby` falls back to that id rather than overwriting a
 * consumer's, so the group can also be labelled directly. Pairs with `createListbox`'s
 * `groupToItems`, which flattens the entries into navigation order and is the only thing a group
 * teaches the list primitives — virtual mode is flat and has no groups at all.
 *
 * Takes props, not `state`: it holds no listbox behavior of its own.
 */
export function createListboxGroup(
  props: JSX.HTMLAttributes<HTMLElement> = {},
): CreateListboxGroupReturn {
  // Solid 2.0 throws `[REACTIVE_WRITE_IN_OWNED_SCOPE]` when a descendant writes a signal an ancestor
  // owns, and that error does not merely fail the group — it **halts the whole reactive system**, so
  // nothing on the page updates again. The label writes here from its own lifecycle, and a Combobox
  // filter reaches the throwing path: a query that empties a group drops the group entry, `<For>`
  // disposes the row inside its own memo, and the label's teardown then writes from an owned scope.
  // `ownedWrite` is the framework's sanctioned opt-in rather than a suppression — being written by a
  // descendant is what this signal is *for*. Same escape hatch as `../internal/create-collection.ts`.
  const [labelId, setLabelId] = createSignal<string | undefined>(undefined, {
    ownedWrite: true,
  });

  const elementProps = merge(props, {
    get role() {
      return "group" as const;
    },
    get "aria-labelledby"() {
      return props["aria-labelledby"] ?? labelId();
    },
  });

  return { props: elementProps, labelId, setLabelId };
}
