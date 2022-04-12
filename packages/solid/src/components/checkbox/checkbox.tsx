import { createContext, splitProps, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import { useStyleConfig } from "../../hope-provider";
import { SystemStyleObject } from "../../styled-system/types";
import { classNames, createClassSelector } from "../../utils/css";
import { RightJoinProps } from "../../utils/types";
import { ElementType } from "../types";
import { CheckboxPrimitive, CheckboxPrimitiveProps } from "./checkbox.primitive";
import { CheckboxControlVariants, checkboxWrapperStyles } from "./checkbox.styles";
import { useCheckboxGroupContext } from "./checkbox-group";

export type ThemeableCheckboxOptions = CheckboxControlVariants;

export type CheckboxProps<C extends ElementType = "label"> = RightJoinProps<
  CheckboxPrimitiveProps<C>,
  ThemeableCheckboxOptions
>;

type CheckboxState = Required<CheckboxControlVariants>;

const hopeCheckboxClass = "hope-checkbox";
const hopeCheckboxInputClass = "hope-checkbox__input";

/**
 * The component that provides context for all part of a `checkbox`.
 * It act as a container and renders a `label` with a visualy hidden `input[type=checkbox]`.
 */
export function Checkbox<C extends ElementType = "label">(props: CheckboxProps<C>) {
  const theme = useStyleConfig().Checkbox;

  const checkboxGroupContext = useCheckboxGroupContext();

  const [state] = createStore<CheckboxState>({
    get variant() {
      return props.variant ?? checkboxGroupContext?.state?.variant ?? theme?.defaultProps?.root?.variant ?? "outline";
    },
    get colorScheme() {
      return (
        props.colorScheme ??
        checkboxGroupContext?.state?.colorScheme ??
        theme?.defaultProps?.root?.colorScheme ??
        "primary"
      );
    },
    get size() {
      return props.size ?? checkboxGroupContext?.state?.size ?? theme?.defaultProps?.root?.size ?? "md";
    },
  });

  const [local, others] = splitProps(props, ["class", "variant", "colorScheme", "size"]);

  const wrapperClasses = () => {
    return classNames(local.class, hopeCheckboxClass, checkboxWrapperStyles({ size: state.size }));
  };

  const context: CheckboxContextValue = {
    state,
  };

  return (
    <CheckboxContext.Provider value={context}>
      <CheckboxPrimitive class={wrapperClasses()} inputClass={hopeCheckboxInputClass} {...others} />
    </CheckboxContext.Provider>
  );
}

Checkbox.toString = () => createClassSelector(hopeCheckboxClass);

/* -------------------------------------------------------------------------------------------------
 * Context
 * -----------------------------------------------------------------------------------------------*/

interface CheckboxContextValue {
  state: CheckboxState;
}

const CheckboxContext = createContext<CheckboxContextValue>();

export function useCheckboxContext() {
  const context = useContext(CheckboxContext);

  if (!context) {
    throw new Error("[Hope UI]: useCheckboxContext must be used within a `<Checkbox />` component");
  }

  return context;
}

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
