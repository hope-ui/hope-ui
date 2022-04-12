import { JSX, Match, mergeProps, Show, splitProps, Switch } from "solid-js";

import { useStyleConfig } from "../../hope-provider";
import { SystemStyleObject } from "../../styled-system/types";
import { classNames, createClassSelector } from "../../utils/css";
import { OverrideProps } from "../../utils/types";
import { hope } from "../factory";
import { createIcon } from "../icon/create-icon";
import { ElementType } from "../types";
import {
  checkboxControlStyles,
  CheckboxControlVariants,
  checkboxLabelStyles,
  checkboxWrapperStyles,
  CheckboxWrapperVariants,
} from "./checkbox.styles";
import { useCheckboxGroupContext } from "./checkbox-group";
import { CheckboxPrimitive, CheckboxPrimitiveProps } from "./checkbox-primitive";

export type ThemeableCheckboxOptions = CheckboxWrapperVariants & CheckboxControlVariants;

interface CheckboxOptions extends ThemeableCheckboxOptions {
  /**
   * The checked icon to use.
   */
  iconChecked?: JSX.Element;

  /**
   * The indeterminate icon to use.
   */
  iconIndeterminate?: JSX.Element;

  /**
   * The children of the checkbox.
   */
  children?: JSX.Element;
}

export type CheckboxProps<C extends ElementType = "label"> = OverrideProps<CheckboxPrimitiveProps<C>, CheckboxOptions>;

const hopeCheckboxClass = "hope-checkbox";
const hopeCheckboxInputClass = "hope-checkbox__input";
const hopeCheckboxControlClass = "hope-checkbox__control";
const hopeCheckboxLabelClass = "hope-checkbox__label";

/**
 * Checkbox is used when a user needs to select
 * multiple values from several options.
 */
export function Checkbox<C extends ElementType = "label">(props: CheckboxProps<C>) {
  const theme = useStyleConfig().Checkbox;

  const checkboxGroupContext = useCheckboxGroupContext();

  const defaultProps: CheckboxProps<"label"> = {
    variant: checkboxGroupContext?.state?.variant ?? theme?.defaultProps?.root?.variant ?? "outline",
    colorScheme: checkboxGroupContext?.state?.colorScheme ?? theme?.defaultProps?.root?.colorScheme ?? "primary",
    size: checkboxGroupContext?.state?.size ?? theme?.defaultProps?.root?.size ?? "md",
    labelPlacement: checkboxGroupContext?.state?.labelPlacement ?? theme?.defaultProps?.root?.labelPlacement ?? "end",
  };

  const propsWitDefault: CheckboxProps<"label"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWitDefault, [
    "children",
    "class",
    "variant",
    "colorScheme",
    "size",
    "labelPlacement",
    "iconChecked",
    "iconIndeterminate",
  ]);

  const wrapperClasses = () => {
    return classNames(
      local.class,
      hopeCheckboxClass,
      checkboxWrapperStyles({
        size: local.size,
        labelPlacement: local.labelPlacement,
      })
    );
  };

  const controlClasses = () => {
    return classNames(
      hopeCheckboxControlClass,
      checkboxControlStyles({
        variant: local.variant,
        colorScheme: local.colorScheme,
        size: local.size,
      })
    );
  };

  const labelClasses = () => {
    return classNames(
      local.class,
      hopeCheckboxLabelClass,
      checkboxLabelStyles({
        labelPlacement: local.labelPlacement,
      })
    );
  };

  return (
    <CheckboxPrimitive
      class={wrapperClasses()}
      inputClass={hopeCheckboxInputClass}
      __baseStyle={theme?.baseStyle?.root}
      {...others}
    >
      {({ state }) => (
        <>
          <hope.span
            aria-hidden={true}
            class={controlClasses()}
            __baseStyle={theme?.baseStyle?.control}
            data-indeterminate={state()["data-indeterminate"]}
            data-focus={state()["data-focus"]}
            data-checked={state()["data-checked"]}
            data-required={state()["data-required"]}
            data-disabled={state()["data-disabled"]}
            data-invalid={state()["data-invalid"]}
            data-readonly={state()["data-readonly"]}
          >
            <Switch>
              <Match when={state().indeterminate}>
                <Show when={local.iconIndeterminate} fallback={<CheckboxIconIndeterminate />}>
                  {local.iconIndeterminate}
                </Show>
              </Match>
              <Match when={state().checked && !state().indeterminate}>
                <Show when={local.iconChecked} fallback={<CheckboxIconCheck />}>
                  {local.iconChecked}
                </Show>
              </Match>
            </Switch>
          </hope.span>
          <hope.span
            class={labelClasses()}
            __baseStyle={theme?.baseStyle?.label}
            data-indeterminate={state()["data-indeterminate"]}
            data-focus={state()["data-focus"]}
            data-checked={state()["data-checked"]}
            data-required={state()["data-required"]}
            data-disabled={state()["data-disabled"]}
            data-invalid={state()["data-invalid"]}
            data-readonly={state()["data-readonly"]}
          >
            {local.children}
          </hope.span>
        </>
      )}
    </CheckboxPrimitive>
  );
}

Checkbox.toString = () => createClassSelector(hopeCheckboxClass);

/* -------------------------------------------------------------------------------------------------
 * StyleConfig
 * -----------------------------------------------------------------------------------------------*/

export interface CheckboxStyleConfig {
  baseStyle?: {
    root?: SystemStyleObject;
    group?: SystemStyleObject;
    control?: SystemStyleObject;
    label?: SystemStyleObject;
  };
  defaultProps?: {
    root?: ThemeableCheckboxOptions;
    group?: ThemeableCheckboxOptions;
  };
}

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
