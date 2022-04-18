import { createMemo, splitProps } from "solid-js";

import { useStyleConfig } from "../../hope-provider";
import { classNames, createClassSelector } from "../../utils/css";
import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { usePopoverContext } from "./popover";
import { popoverArrowStyles, PopoverArrowVariants } from "./popover.styles";

export type PopoverArrowProps<C extends ElementType = "div"> = HTMLHopeProps<C>;

const hopePopoverArrowClass = "hope-popover__arrow";

export function PopoverArrow<C extends ElementType = "div">(props: PopoverArrowProps<C>) {
  const theme = useStyleConfig().Popover;

  const popoverContext = usePopoverContext();

  const [local, others] = splitProps(props, ["class"]);

  const placement = createMemo(() => {
    return popoverContext.state.finalPlacement.split(
      "-"
    )[0] as PopoverArrowVariants["popoverPlacement"];
  });

  const classes = () => {
    return classNames(
      local.class,
      hopePopoverArrowClass,
      popoverArrowStyles({
        popoverPlacement: placement(),
      })
    );
  };

  return (
    <Box
      ref={popoverContext.assignArrowRef}
      class={classes()}
      __baseStyle={theme?.baseStyle?.arrow}
      {...others}
    />
  );
}

PopoverArrow.toString = () => createClassSelector(hopePopoverArrowClass);
