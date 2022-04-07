import { splitProps } from "solid-js";

import { useComponentStyleConfigs } from "../../theme/provider";
import { classNames, createClassSelector } from "../../utils/css";
import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";
import { useCheckboxContext } from "./checkbox";
import { checkboxLabelStyles } from "./checkbox.styles";

export type CheckboxLabelProp<C extends ElementType = "span"> = HTMLHopeProps<C>;

const hopeCheckboxLabelClass = "hope-checkbox__label";

/**
 * The label of the checkbox.
 */
export function CheckboxLabel<C extends ElementType = "span">(props: CheckboxLabelProp<C>) {
  const theme = useComponentStyleConfigs().Checkbox;

  const checkboxContext = useCheckboxContext();

  const [local, others] = splitProps(props, ["class"]);

  const classes = () => {
    return classNames(local.class, hopeCheckboxLabelClass, checkboxLabelStyles());
  };

  return (
    <hope.span
      class={classes()}
      __baseStyle={theme?.baseStyle?.label}
      data-indeterminate={checkboxContext.state["data-indeterminate"]}
      data-focus={checkboxContext.state["data-focus"]}
      data-checked={checkboxContext.state["data-checked"]}
      data-required={checkboxContext.state["data-required"]}
      data-disabled={checkboxContext.state["data-disabled"]}
      data-invalid={checkboxContext.state["data-invalid"]}
      data-readonly={checkboxContext.state["data-readonly"]}
      {...others}
    />
  );
}

CheckboxLabel.toString = () => createClassSelector(hopeCheckboxLabelClass);
