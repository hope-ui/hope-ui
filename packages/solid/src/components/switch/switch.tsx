import { JSX, mergeProps, splitProps } from "solid-js";

import { useStyleConfig } from "../../hope-provider";
import { SystemStyleObject } from "../../styled-system/types";
import { OverrideProps } from "../../utils";
import { classNames, createClassSelector } from "../../utils/css";
import { Box } from "../box/box";
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

export type SwitchProps<C extends ElementType = "button"> = OverrideProps<SwitchPrimitiveProps<C>, SwitchOptions>;

const hopeSwitchClass = "hope-switch";
const hopeSwitchControlClass = "hope-switch__control";
const hopeSwitchLabelClass = "hope-switch__label";

/**
 * The component that provides context for all part of a `checkbox`.
 * It act as a container and renders a `label` with a visualy hidden `input[type=checkbox][role=switch]`.
 */
export function Switch<C extends ElementType = "label">(props: SwitchProps<C>) {
  const theme = useStyleConfig().Switch;

  const defaultProps: SwitchProps<"button"> = {
    variant: theme?.defaultProps?.root?.variant ?? "outline",
    colorScheme: theme?.defaultProps?.root?.colorScheme ?? "primary",
    size: theme?.defaultProps?.root?.size ?? "md",
    labelPlacement: theme?.defaultProps?.root?.labelPlacement ?? "start",
  };

  const propsWitDefault: SwitchProps<"button"> = mergeProps(defaultProps, props);
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
    return classNames(local.class, hopeSwitchLabelClass, switchLabelStyles());
  };

  return (
    <Box>
      <SwitchPrimitive />
      <hope.label class={labelClasses()}>{local.children}</hope.label>
    </Box>
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
