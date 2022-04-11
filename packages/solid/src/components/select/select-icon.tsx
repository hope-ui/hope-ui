import { splitProps } from "solid-js";

import { useStyleConfig } from "../../hope-provider";
import { classNames, createClassSelector } from "../../utils/css";
import { IconSelector } from "../icons/IconSelector";
import { ElementType, HTMLHopeProps } from "../types";
import { useSelectContext } from "./select";
import { selectIconStyles } from "./select.styles";

interface SelectIconOptions {
  /**
   * If `true`, the icon will rotate when the select is open.
   */
  rotateOnOpen?: boolean;
}

type SelectIconProps<C extends ElementType = "svg"> = HTMLHopeProps<C, SelectIconOptions>;

const hopeSelectIconClass = "hope-select__icon";

/**
 * A small icon often displayed next to the value as a visual affordance for the fact it can be open.
 */
export function SelectIcon<C extends ElementType = "svg">(props: SelectIconProps<C>) {
  const theme = useStyleConfig().Select;

  const selectContext = useSelectContext();

  const [local, others] = splitProps(props, ["class", "rotateOnOpen"]);

  const classes = () => {
    return classNames(
      local.class,
      hopeSelectIconClass,
      selectIconStyles(
        local.rotateOnOpen
          ? {
              opened: selectContext.state.opened,
            }
          : undefined
      )
    );
  };

  return <IconSelector aria-hidden class={classes()} __baseStyle={theme?.baseStyle?.icon} {...others} />;
}

SelectIcon.toString = () => createClassSelector(hopeSelectIconClass);
