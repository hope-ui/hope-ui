import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Component, omit } from "solid-js";
import { useZagDialogContext } from "./zag-dialog-context";
import { mergePartProps } from "./zag-dialog-merge-props";

export interface ZagDialogTriggerProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  render?: RenderProp<JSX.ButtonHTMLAttributes<HTMLButtonElement>>;
}

/**
 * The trigger carries no recipe slot — a consumer usually renders their own `Button` via `render`.
 *
 * `id` is stripped from the consumer's props, here and in every other Zag-backed part: the machine
 * derives each part id from its scope (`dialog:<id>:trigger`) and then finds that element with
 * `getElementById`, so honouring a consumer `id` would break focus return, the dismiss layer's
 * trigger exclusion, and the aria-hiding. The supported route is the machine's `ids` prop on
 * `Root`, which `ZagDialog` does not expose. See `__internal__/spikes/zag-dialog-findings.md`.
 */
export const Trigger: Component<ZagDialogTriggerProps> = (props) => {
  const ctx = useZagDialogContext();
  const rest = omit(props, "render", "id");

  const elementProps = mergePartProps(
    () => ctx.api().getTriggerProps(),
    () => rest,
  );

  return renderElement<JSX.ButtonHTMLAttributes<HTMLButtonElement>>({
    as: "button",
    render: props.render,
    props: elementProps,
  });
};
