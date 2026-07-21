import type { JSX } from "@solidjs/web";
import { merge } from "solid-js";

export interface CreateListboxSeparatorReturn {
  /** Spread onto the separator element (`role="presentation"` + `aria-hidden`). `ref` omitted. */
  props: Omit<JSX.HTMLAttributes<HTMLElement>, "ref">;
}

/**
 * The separator part: a purely visual divider between groups of options. It is
 * `role="presentation"` + `aria-hidden`, **not** `role="separator"` — a `separator` is not a valid
 * child of a `listbox`, and a real separator would also be reported as an item by some assistive
 * tech. Takes props (not `state`); it holds no listbox behavior.
 */
export function createListboxSeparator(
  props: JSX.HTMLAttributes<HTMLElement> = {},
): CreateListboxSeparatorReturn {
  const elementProps = merge(props, {
    get role() {
      return "presentation" as const;
    },
    get "aria-hidden"() {
      return "true" as const;
    },
  });

  return { props: elementProps };
}
