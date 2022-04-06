import { JSX, Match, mergeProps, splitProps, Switch } from "solid-js";

import { useComponentStyleConfigs } from "../../theme/provider";
import { classNames, createClassSelector } from "../../utils/css";
import { hope } from "../factory";
import { createIcon } from "../icon/create-icon";
import { ElementType, HTMLHopeProps } from "../types";
import { useCheckboxContext } from "./checkbox";
import { checkboxControlStyles } from "./checkbox.styles";

interface CheckboxControlOptions {
  /**
   * The checked icon to use
   */
  iconChecked?: JSX.Element;

  /**
   * The indeterminate icon to use
   */
  iconIndeterminate?: JSX.Element;
}

export type CheckboxControlProps<C extends ElementType = "span"> = HTMLHopeProps<C, CheckboxControlOptions>;

const hopeCheckboxControlClass = "hope-checkbox__control";

/**
 * The visual control that represents a `checkbox`.
 */
export function CheckboxControl<C extends ElementType = "span">(props: CheckboxControlProps<C>) {
  const theme = useComponentStyleConfigs().Checkbox;

  const checkboxContext = useCheckboxContext();

  const defaultProps: CheckboxControlProps<"span"> = {
    iconChecked: <CheckboxIconCheck />,
    iconIndeterminate: <CheckboxIconIndeterminate />,
  };

  const propsWithDefaults: CheckboxControlProps<"span"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefaults, ["class", "children", "iconChecked", "iconIndeterminate"]);

  const classes = () => {
    return classNames(
      local.class,
      hopeCheckboxControlClass,
      checkboxControlStyles({
        variant: checkboxContext.state.variant,
        colorScheme: checkboxContext.state.colorScheme,
        size: checkboxContext.state.size,
      })
    );
  };

  return (
    <hope.span
      aria-hidden={true}
      class={classes()}
      __baseStyle={theme?.baseStyle?.control}
      data-indeterminate={checkboxContext.state["data-indeterminate"]}
      data-focus={checkboxContext.state["data-focus"]}
      data-checked={checkboxContext.state["data-checked"]}
      data-required={checkboxContext.state["data-required"]}
      data-disabled={checkboxContext.state["data-disabled"]}
      data-invalid={checkboxContext.state["data-invalid"]}
      data-readonly={checkboxContext.state["data-readonly"]}
      {...others}
    >
      <Switch>
        <Match when={checkboxContext.state.indeterminate}>{local.iconIndeterminate}</Match>
        <Match when={checkboxContext.state.checked && !checkboxContext.state.indeterminate}>{local.iconChecked}</Match>
      </Switch>
    </hope.span>
  );
}

CheckboxControl.toString = () => createClassSelector(hopeCheckboxControlClass);

/* -------------------------------------------------------------------------------------------------
 * Icons
 * -----------------------------------------------------------------------------------------------*/

// A thicker version of radix-icon-check
const CheckboxIconCheck = createIcon({
  viewBox: "0 0 15 15",
  path: () => (
    <path
      d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
      fill="currentColor"
      stroke="currentColor"
      stroke-width="1"
      fill-rule="evenodd"
      clip-rule="evenodd"
    />
  ),
});

// A thicker version of radix-icon-minus
const CheckboxIconIndeterminate = createIcon({
  viewBox: "0 0 15 15",
  path: () => (
    <path
      d="M2.25 7.5C2.25 7.22386 2.47386 7 2.75 7H12.25C12.5261 7 12.75 7.22386 12.75 7.5C12.75 7.77614 12.5261 8 12.25 8H2.75C2.47386 8 2.25 7.77614 2.25 7.5Z"
      fill="currentColor"
      stroke="currentColor"
      stroke-width="1"
      fill-rule="evenodd"
      clip-rule="evenodd"
    />
  ),
});
