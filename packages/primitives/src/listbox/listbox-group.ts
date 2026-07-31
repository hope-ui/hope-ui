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
 * The group part: a `role="group"` wrapper that names itself from its `GroupLabel`. It owns a label
 * id signal (`createListboxGroupLabel` registers into it), mirroring the `createDialog` →
 * `createDialogTitle` id split. Its `aria-labelledby` falls back to the consumer's rather than
 * overwriting it, so a consumer can label the group directly. Pairs with `createListbox`'s
 * `groupToItems`, which flattens the entries into navigation order and is the only thing the kernel
 * learns from a group — virtual mode is flat and has none. Takes props (not `state`); it holds no
 * listbox behavior.
 */
export function createListboxGroup(
  props: JSX.HTMLAttributes<HTMLElement> = {},
): CreateListboxGroupReturn {
  // `ownedWrite` because the label registers into this from a **descendant's** lifecycle, via
  // `createRegisteredId` — and the group can be unmounted by a `<For>` reconciliation rather than by
  // an effect cleanup. Combobox's filter is what does it: a query that empties a group drops the
  // group entry, `<For>` disposes the row *inside its own memo*, and the label's `onSettled` teardown
  // then writes here from an owned scope. Without this, that write throws
  // `[REACTIVE_WRITE_IN_OWNED_SCOPE]` — which does not merely fail the group, it **halts the whole
  // reactive system**, so nothing on the page updates again. Same reasoning and the same escape hatch
  // as `create-collection.ts`'s registry, and it is framework-sanctioned rather than a suppression:
  // being written by a descendant is what this signal is *for*.
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
