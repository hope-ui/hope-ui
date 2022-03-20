import { children, JSX, Show, splitProps } from "solid-js";

import { useComponentStyleConfigs } from "@/theme/provider";
import { isFunction } from "@/utils/assertion";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { IconSelector } from "../icons/IconSelector";
import { ElementType, HTMLHopeProps } from "../types";
import { useSelectContext } from "./select";
import { selectIconStyles } from "./select.styles";

interface SelectIconOptions {
  children?: JSX.Element | ((props: { opened: boolean }) => JSX.Element);
}

type SelectIconProps<C extends ElementType = "div"> = HTMLHopeProps<C, SelectIconOptions>;

const hopeSelectIconClass = "hope-select__icon";

/**
 * A small icon often displayed next to the value as a visual affordance for the fact it can be open.
 */
export function SelectIcon<C extends ElementType = "div">(props: SelectIconProps<C>) {
  const theme = useComponentStyleConfigs().Select;

  const selectContext = useSelectContext();

  const [local, others] = splitProps(props as SelectIconProps<"div">, ["class", "children"]);

  const classes = () => classNames(local.class, hopeSelectIconClass, selectIconStyles());

  const resolvedChildren = children(() => {
    if (isFunction(local.children)) {
      return local.children({ opened: selectContext.state.opened });
    }

    return local.children;
  });

  return (
    <Box aria-hidden="true" class={classes()} __baseStyle={theme?.baseStyle?.icon} {...others}>
      <Show when={resolvedChildren()} fallback={<IconSelector />}>
        {resolvedChildren()}
      </Show>
    </Box>
  );
}

SelectIcon.toString = () => createClassSelector(hopeSelectIconClass);
