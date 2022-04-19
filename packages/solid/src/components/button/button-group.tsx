import { createContext, mergeProps, splitProps, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import { MarginProps } from "../../styled-system/props/margin";
import { useStyleConfig } from "../../hope-provider";
import { classNames, createClassSelector } from "../../utils/css";
import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { ButtonOptions } from "./button";
import { buttonGroupStyles } from "./button.styles";

interface ButtonGroupOptions extends Pick<ButtonOptions, "variant" | "colorScheme" | "size"> {
  /**
   * If `true`, the borderRadius of button that are direct children will be altered
   * to look flushed together.
   */
  attached?: boolean;

  /**
   * The spacing between each buttons.
   */
  spacing?: MarginProps["marginRight"];

  /**
   * If `true`, all wrapped button will be disabled.
   */
  disabled?: boolean;
}

export type ThemeableButtonGroupOptions = Omit<ButtonGroupOptions, "disabled">;

export type ButtonGroupProps<C extends ElementType = "div"> = HTMLHopeProps<C, ButtonGroupOptions>;

const hopeButtonGroupClass = "hope-button__group";

type ButtonGroupState = Pick<ButtonGroupProps, "variant" | "colorScheme" | "size" | "disabled">;

interface ButtonGroupContextValue {
  state: ButtonGroupState;
}

const ButtonGroupContext = createContext<ButtonGroupContextValue>();

export function ButtonGroup<C extends ElementType = "div">(props: ButtonGroupProps<C>) {
  const theme = useStyleConfig().Button;

  const [state] = createStore<ButtonGroupState>({
    get variant() {
      return props.variant ?? theme?.defaultProps?.group?.variant;
    },
    get colorScheme() {
      return props.colorScheme ?? theme?.defaultProps?.group?.colorScheme;
    },
    get size() {
      return props.size ?? theme?.defaultProps?.group?.size;
    },
    get disabled() {
      return props.disabled;
    },
  });

  const defaultProps: ButtonGroupProps<"div"> = {
    attached: theme?.defaultProps?.group?.attached ?? false,
    spacing: theme?.defaultProps?.group?.spacing ?? "0.5rem",
  };

  const propsWithDefault: ButtonGroupProps<"div"> = mergeProps(defaultProps, props);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [local, _, others] = splitProps(
    propsWithDefault,
    ["class", "attached", "spacing"],
    ["variant", "colorScheme", "size", "disabled"]
  );

  const classes = () => {
    return classNames(
      local.class,
      hopeButtonGroupClass,
      buttonGroupStyles({
        css: local.attached
          ? {
              "> *:first-of-type:not(:last-of-type)": { borderRightRadius: 0 },
              "> *:not(:first-of-type):not(:last-of-type)": { borderRadius: 0 },
              "> *:not(:first-of-type):last-of-type": { borderLeftRadius: 0 },
            }
          : {
              "& > *:not(style) ~ *:not(style)": { marginStart: local.spacing },
            },
      })
    );
  };

  const context: ButtonGroupContextValue = {
    state,
  };

  return (
    <ButtonGroupContext.Provider value={context}>
      <Box role="group" class={classes()} __baseStyle={theme?.baseStyle?.group} {...others} />
    </ButtonGroupContext.Provider>
  );
}

ButtonGroup.toString = () => createClassSelector(hopeButtonGroupClass);

export function useButtonGroupContext() {
  return useContext(ButtonGroupContext);
}
