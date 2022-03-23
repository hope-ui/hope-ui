import { splitProps } from "solid-js";

import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";
import { useSwitchContext } from "./switch";
import { switchLabelStyles } from "./switch.styles";

export type SwitchLabelProp<C extends ElementType = "span"> = HTMLHopeProps<C>;

const hopeSwitchLabelClass = "hope-switch__label";

/**
 * The label of the switch.
 */
export function SwitchLabel<C extends ElementType = "span">(props: SwitchLabelProp<C>) {
  const theme = useComponentStyleConfigs().Switch;

  const switchContext = useSwitchContext();

  const [local, others] = splitProps(props, ["class"]);

  const classes = () => {
    return classNames(local.class, hopeSwitchLabelClass, switchLabelStyles());
  };

  return (
    <hope.span
      class={classes()}
      __baseStyle={theme?.baseStyle?.label}
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

SwitchLabel.toString = () => createClassSelector(hopeSwitchLabelClass);
