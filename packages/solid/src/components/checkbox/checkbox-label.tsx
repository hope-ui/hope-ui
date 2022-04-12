import { splitProps } from "solid-js";

import { useStyleConfig } from "../../hope-provider";
import { classNames, createClassSelector } from "../../utils/css";
import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";
import { useCheckboxPrimitiveContext } from "./checkbox.primitive";
import { checkboxLabelStyles } from "./checkbox.styles";

export type CheckboxLabelProp<C extends ElementType = "span"> = HTMLHopeProps<C>;

const hopeCheckboxLabelClass = "hope-checkbox__label";

/**
 * The label of the checkbox.
 */
export function CheckboxLabel<C extends ElementType = "span">(props: CheckboxLabelProp<C>) {
  const theme = useStyleConfig().Checkbox;

  const checkboxPrimitiveContext = useCheckboxPrimitiveContext();

  const [local, others] = splitProps(props, ["class"]);

  const classes = () => {
    return classNames(local.class, hopeCheckboxLabelClass, checkboxLabelStyles());
  };

  return (
    <hope.span
      class={classes()}
      __baseStyle={theme?.baseStyle?.label}
      data-indeterminate={checkboxPrimitiveContext.state["data-indeterminate"]}
      data-focus={checkboxPrimitiveContext.state["data-focus"]}
      data-checked={checkboxPrimitiveContext.state["data-checked"]}
      data-required={checkboxPrimitiveContext.state["data-required"]}
      data-disabled={checkboxPrimitiveContext.state["data-disabled"]}
      data-invalid={checkboxPrimitiveContext.state["data-invalid"]}
      data-readonly={checkboxPrimitiveContext.state["data-readonly"]}
      {...others}
    />
  );
}

CheckboxLabel.toString = () => createClassSelector(hopeCheckboxLabelClass);
