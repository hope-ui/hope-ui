import { splitProps } from "solid-js";

import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";
import { useRadioContext } from "./radio";
import { radioLabelStyles } from "./radio.styles";

export type RadioLabelProp<C extends ElementType = "span"> = HTMLHopeProps<C>;

const hopeRadioLabelClass = "hope-radio__label";

export function RadioLabel<C extends ElementType = "span">(props: RadioLabelProp<C>) {
  const theme = useComponentStyleConfigs().Radio;

  const radioContext = useRadioContext();

  const [local, others] = splitProps(props, ["class"]);

  const classes = () => {
    return classNames(local.class, hopeRadioLabelClass, radioLabelStyles());
  };

  return (
    <hope.span
      class={classes()}
      __baseStyle={theme?.baseStyle?.label}
      for={radioContext.state.id}
      data-focus={radioContext.state.dataAttrs["data-focus"]}
      data-checked={radioContext.state.dataAttrs["data-checked"]}
      data-required={radioContext.state.dataAttrs["data-required"]}
      data-disabled={radioContext.state.dataAttrs["data-disabled"]}
      data-invalid={radioContext.state.dataAttrs["data-invalid"]}
      data-readonly={radioContext.state.dataAttrs["data-readonly"]}
      {...others}
    />
  );
}

RadioLabel.toString = () => createClassSelector(hopeRadioLabelClass);
