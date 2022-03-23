import { splitProps } from "solid-js";

import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";
import { useSwitchContext } from "./switch";
import { switchControlStyles } from "./switch.styles";

export type SwitchControlProp<C extends ElementType = "span"> = HTMLHopeProps<C>;

const hopeSwitchControlClass = "hope-switch__control";

/**
 * The visual control that represents a `switch`.
 */
export function SwitchControl<C extends ElementType = "span">(props: SwitchControlProp<C>) {
  const theme = useComponentStyleConfigs().Switch;

  const switchContext = useSwitchContext();

  const [local, others] = splitProps(props, ["class"]);

  const classes = () => {
    return classNames(
      local.class,
      hopeSwitchControlClass,
      switchControlStyles({
        variant: switchContext.state.variant,
        colorScheme: switchContext.state.colorScheme,
        size: switchContext.state.size,
      })
    );
  };

  return (
    <hope.span
      aria-hidden={true}
      class={classes()}
      __baseStyle={theme?.baseStyle?.control}
      data-focus={switchContext.state["data-focus"]}
      data-checked={switchContext.state["data-checked"]}
      data-required={switchContext.state["data-required"]}
      data-disabled={switchContext.state["data-disabled"]}
      data-invalid={switchContext.state["data-invalid"]}
      data-readonly={switchContext.state["data-readonly"]}
      {...others}
    />
  );
}

SwitchControl.toString = () => createClassSelector(hopeSwitchControlClass);
