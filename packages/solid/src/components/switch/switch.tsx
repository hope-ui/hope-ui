import { JSX, mergeProps, splitProps } from "solid-js";

import { useStyleConfig } from "../../hope-provider";
import { SystemStyleObject } from "../../styled-system/types";
import { OverrideProps } from "../../utils";
import { classNames, createClassSelector } from "../../utils/css";
import { hope } from "../factory";
import { ElementType } from "../types";
import {
  switchControlStyles,
  SwitchControlVariants,
  switchLabelStyles,
  switchWrapperStyles,
  SwitchWrapperVariants,
} from "./switch.styles";
import { SwitchPrimitive, SwitchPrimitiveProps } from "./switch-primitive";

type ThemeableSwitchOptions = SwitchWrapperVariants & SwitchControlVariants;

interface SwitchOptions extends ThemeableSwitchOptions {
  /**
   * The children of the switch.
   */
  children?: JSX.Element;
}

export type SwitchProps<C extends ElementType = "label"> = OverrideProps<
  SwitchPrimitiveProps<C>,
  SwitchOptions
>;

const hopeSwitchClass = "hope-switch";
const hopeSwitchInputClass = "hope-checkbox__input";
const hopeSwitchControlClass = "hope-switch__control";
const hopeSwitchLabelClass = "hope-switch__label";

/**
 * Switches allow users to turn an individual option on or off.
 * They are usually used to activate or deactivate a specific setting.
 */
export function Switch<C extends ElementType = "label">(props: SwitchProps<C>) {
  const theme = useStyleConfig().Switch;

  const defaultProps: SwitchProps<"label"> = {
    variant: theme?.defaultProps?.root?.variant ?? "filled",
    colorScheme: theme?.defaultProps?.root?.colorScheme ?? "primary",
    size: theme?.defaultProps?.root?.size ?? "md",
    labelPlacement: theme?.defaultProps?.root?.labelPlacement ?? "start",
  };

  const propsWitDefault: SwitchProps<"label"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWitDefault, [
    "children",
    "class",
    "variant",
    "colorScheme",
    "size",
    "labelPlacement",
  ]);

  const wrapperClasses = () => {
    return classNames(
      local.class,
      hopeSwitchClass,
      switchWrapperStyles({
        size: local.size,
        labelPlacement: local.labelPlacement,
      })
    );
  };

  const controlClasses = () => {
    return classNames(
      hopeSwitchControlClass,
      switchControlStyles({
        variant: local.variant,
        colorScheme: local.colorScheme,
        size: local.size,
      })
    );
  };

  const labelClasses = () => {
    return classNames(hopeSwitchLabelClass, switchLabelStyles());
  };

  return (
    <SwitchPrimitive
      class={wrapperClasses()}
      inputClass={hopeSwitchInputClass}
      __baseStyle={theme?.baseStyle?.root}
      {...others}
    >
      {({ state }) => (
        <>
          <hope.span
            class={labelClasses()}
            __baseStyle={theme?.baseStyle?.label}
            data-focus={state()["data-focus"]}
            data-checked={state()["data-checked"]}
            data-required={state()["data-required"]}
            data-disabled={state()["data-disabled"]}
            data-invalid={state()["data-invalid"]}
            data-readonly={state()["data-readonly"]}
          >
            {local.children}
          </hope.span>
          <hope.span
            aria-hidden={true}
            class={controlClasses()}
            __baseStyle={theme?.baseStyle?.control}
            data-focus={state()["data-focus"]}
            data-checked={state()["data-checked"]}
            data-required={state()["data-required"]}
            data-disabled={state()["data-disabled"]}
            data-invalid={state()["data-invalid"]}
            data-readonly={state()["data-readonly"]}
          />
        </>
      )}
    </SwitchPrimitive>
  );
}

Switch.toString = () => createClassSelector(hopeSwitchClass);

/* -------------------------------------------------------------------------------------------------
 * StyleConfig
 * -----------------------------------------------------------------------------------------------*/

export interface SwitchStyleConfig {
  baseStyle?: {
    root?: SystemStyleObject;
    control?: SystemStyleObject;
    label?: SystemStyleObject;
  };
  defaultProps?: {
    root?: ThemeableSwitchOptions;
  };
}
