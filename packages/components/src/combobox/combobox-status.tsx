import { createComboboxStatus } from "@hope-ui/primitives/combobox";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
import { useComboboxContext } from "./combobox-context";

type ComboboxStatusElementProps = JSX.HTMLAttributes<HTMLDivElement>;

export interface ComboboxStatusProps extends Omit<ComboboxStatusElementProps, "children"> {
  /** Renders as a different element/component while keeping Status's computed props (`role="status"`
   *  and the live-region attributes). Pick a target that can hold text and stay mounted. */
  render?: RenderProp<ComboboxStatusElementProps>;
  /** Merged over the recipe's `status` slot (applied last), so the consumer's utilities win. */
  class?: string;
  /**
   * Replaces the default count message. Receives the number of options the current filter left, so
   * an app can localize or reword it:
   *
   * ```tsx
   * <Combobox.Status>{(count) => `${count} résultats`}</Combobox.Status>
   * ```
   *
   * With none, renders `combobox.countAnnouncement` for the active locale.
   */
  children?: JSX.Element | ((count: number) => JSX.Element);
}

/**
 * The result count, both **shown** and **announced**.
 *
 * Filtering is the one thing a combobox does that a screen reader cannot observe: focus does not
 * move, the input's text is the user's own, and the list silently gets shorter. `createComboboxStatus`
 * owns both channels — the `role="status"` live region this element *is* (which announces every count
 * change while the popup stays open) and a `createAnnounce` call for the one moment that region
 * cannot cover, the frame it mounts in. See `combobox-status.md` for why that split is necessary and
 * why it does not double-announce.
 *
 * Like `Combobox.Empty`, it lives in the card **beside** `Combobox.List` — `role="listbox"` may only
 * contain options and groups.
 *
 * It is **visible on purpose**. The count helps a sighted user too, and a visually-hidden live region
 * is one `display: none` away from announcing nothing at all.
 */
export const Status: Component<ComboboxStatusProps> = (props) => {
  const ctx = useComboboxContext();
  // The kernel hook types its props over `HTMLElement` while this part's public surface names the
  // real `<div>`, and `ref` is the one key that won't line up between them. Cast at this seam, per
  // CLAUDE.md — widening the public surface instead would push a cast onto every consumer.
  const status = createComboboxStatus(
    ctx.state,
    omit(props, "render", "class", "children") as unknown as JSX.HTMLAttributes<HTMLElement>,
  );

  const elementProps = merge(status.props, {
    "data-slot": "combobox-status",
    get class(): string {
      return ctx.slots.status(props.class);
    },
    get children(): JSX.Element {
      const display = props.children;
      return typeof display === "function"
        ? display(status.count())
        : (display ?? status.message());
    },
  });

  return renderElement<ComboboxStatusElementProps, HTMLDivElement>({
    as: "div",
    render: props.render,
    props: elementProps as unknown as ComboboxStatusElementProps,
  });
};
