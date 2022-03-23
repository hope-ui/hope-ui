import { splitProps } from "solid-js";

import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";
import { useRadioContext } from "./radio";
import { radioControlStyles } from "./radio.styles";

export type RadioControlProp<C extends ElementType = "span"> = HTMLHopeProps<C>;

const hopeRadioControlClass = "hope-radio__control";

/**
 * The visual control that represents a `radio`.
 */
export function RadioControl<C extends ElementType = "span">(props: RadioControlProp<C>) {
  const theme = useComponentStyleConfigs().Radio;

  const radioContext = useRadioContext();

  const [local, others] = splitProps(props, ["class"]);

  const classes = () => {
    return classNames(
      local.class,
      hopeRadioControlClass,
      radioControlStyles({
        variant: radioContext.state.variant,
        colorScheme: radioContext.state.colorScheme,
        size: radioContext.state.size,
      })
    );
  };

  return (
    <hope.span
      aria-hidden={true}
      class={classes()}
      __baseStyle={theme?.baseStyle?.control}
      data-focus={radioContext.state["data-focus"]}
      data-checked={radioContext.state["data-checked"]}
      data-required={radioContext.state["data-required"]}
      data-disabled={radioContext.state["data-disabled"]}
      data-invalid={radioContext.state["data-invalid"]}
      data-readonly={radioContext.state["data-readonly"]}
      {...others}
    />
  );
}

RadioControl.toString = () => createClassSelector(hopeRadioControlClass);
