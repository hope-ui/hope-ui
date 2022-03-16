import { Show, splitProps } from "solid-js";

import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { IconSelector } from "../icons/IconSelector";
import { ElementType, HTMLHopeProps } from "../types";
import { selectIconStyles } from "./select.styles";

const hopeSelectIconClass = "hope-select__icon";

/**
 * A small icon often displayed next to the value as a visual affordance for the fact it can be open.
 */
export function SelectIcon<C extends ElementType = "div">(props: HTMLHopeProps<C>) {
  const theme = useComponentStyleConfigs().Select;

  const [local, others] = splitProps(props, ["class", "children"]);

  const classes = () => classNames(local.class, hopeSelectIconClass, selectIconStyles());

  return (
    <Box aria-hidden="true" class={classes()} __baseStyle={theme?.baseStyle?.icon} {...others}>
      <Show when={local.children} fallback={<IconSelector />}>
        {local.children}
      </Show>
    </Box>
  );
}

SelectIcon.toString = () => createClassSelector(hopeSelectIconClass);
