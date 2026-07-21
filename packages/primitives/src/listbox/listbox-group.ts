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
 * overwriting it, so a consumer can label the group directly. Collection mode only — virtual mode is
 * flat. Takes props (not `state`); it holds no listbox behavior.
 */
export function createListboxGroup(
  props: JSX.HTMLAttributes<HTMLElement> = {},
): CreateListboxGroupReturn {
  const [labelId, setLabelId] = createSignal<string | undefined>();

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
