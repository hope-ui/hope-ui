import { splitProps } from "solid-js";

import { useStyleConfig } from "../../hope-provider";
import { classNames, createClassSelector } from "../../utils/css";
import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";
import { useRadioContext } from "./radio";
import { radioLabelStyles } from "./radio.styles";

export type RadioLabelProps<C extends ElementType = "span"> = HTMLHopeProps<C>;

const hopeRadioLabelClass = "hope-radio__label";

/**
 * The label of the radio.
 */
export function RadioLabel<C extends ElementType = "span">(props: RadioLabelProps<C>) {
  const theme = useStyleConfig().Radio;

  const radioContext = useRadioContext();

  const [local, others] = splitProps(props, ["class"]);

  const classes = () => {
    return classNames(local.class, hopeRadioLabelClass, radioLabelStyles());
  };

  return (
    <hope.span
      class={classes()}
      __baseStyle={theme?.baseStyle?.label}
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

RadioLabel.toString = () => createClassSelector(hopeRadioLabelClass);
