import { createHopeComponent, hope, useStyleConfigContext } from "@hope-ui/styles";
import { clsx } from "clsx";
import { createEffect, onCleanup, splitProps } from "solid-js";

import { PopoverParts } from "./popover.styles";
import { usePopoverContext } from "./popover-context";

/**
 * PopoverDescription renders a description in a popover.
 * This component must be wrapped with `Popover`,
 * so the `aria-describedby` prop is properly set on the popover element.
 *
 * It renders a `p` by default.
 */
export const PopoverDescription = createHopeComponent<"p">(props => {
  const popoverContext = usePopoverContext();

  const [local, others] = splitProps(props, ["class"]);

  const { baseClasses, styleOverrides } = useStyleConfigContext<PopoverParts>();

  createEffect(() => {
    popoverContext.setDescriptionId(`${popoverContext.popoverId()}-description`);
    onCleanup(() => popoverContext.setDescriptionId(undefined));
  });

  return (
    <hope.p
      id={popoverContext.descriptionId()}
      class={clsx(baseClasses().description, local.class)}
      __css={styleOverrides().description}
      {...others}
    />
  );
});
