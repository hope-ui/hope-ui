import { JSX, mergeProps, Show, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { useTheme } from "@/contexts/HopeContext";
import { IconSpinner } from "@/icons/IconSpinner";
import { XPosition } from "@/theme/types";

import { boxPropNames } from "../Box/Box.styles";
import { ElementType, ExtendableProps, PolymorphicComponentProps } from "../types";
import { commonProps, createCssSelector, generateClassList } from "../utils";
import { buttonLoadingIconStyles, buttonStyles, ButtonVariants } from "./Button.styles";

export interface ButtonOptions extends ButtonVariants {
  disabled?: boolean;
  loaderPosition?: XPosition;
  loader?: JSX.Element;
  leftIcon?: JSX.Element;
  rightIcon?: JSX.Element;
}

export type ThemeableButtonOptions = Pick<
  ButtonOptions,
  | "variant"
  | "colorScheme"
  | "size"
  | "loaderPosition"
  | "compact"
  | "fullWidth"
  | "borderRadius"
  | "textTransform"
>;

export type ButtonProps<C extends ElementType> = PolymorphicComponentProps<C, ButtonOptions>;

const hopeButtonClass = "hope-button";

/**
 * The Button component is used to trigger an action or event,
 * such as submitting a form, opening a dialog, canceling an action, or performing a delete operation.
 */
export function Button<C extends ElementType = "button">(props: ButtonProps<C>) {
  const theme = useTheme().components.Button;

  const defaultProps: ExtendableProps<ButtonProps<"button">, Required<ThemeableButtonOptions>> = {
    as: "button",
    variant: theme?.defaultProps?.variant ?? "solid",
    colorScheme: theme?.defaultProps?.colorScheme ?? "primary",
    size: theme?.defaultProps?.size ?? "md",
    borderRadius: theme?.defaultProps?.borderRadius ?? "sm",
    loaderPosition: theme?.defaultProps?.loaderPosition ?? "left",
    compact: theme?.defaultProps?.compact ?? false,
    textTransform: theme?.defaultProps?.textTransform ?? "none",
    fullWidth: theme?.defaultProps?.fullWidth ?? false,
    loader: <IconSpinner />,
    loading: false,
    disabled: false,
    type: "button",
    role: "button",
  };

  const propsWithDefault: ButtonProps<C> = mergeProps(defaultProps, props);
  const [local, styleProps, others] = splitProps(
    propsWithDefault,
    [...commonProps, "loader", "loaderPosition", "disabled", "leftIcon", "rightIcon", "children"],
    [...boxPropNames, "css", "variant", "colorScheme", "size", "loading", "compact", "fullWidth"]
  );

  const classList = () => {
    return generateClassList({
      hopeClass: hopeButtonClass,
      baseClass: buttonStyles(styleProps),
      classProps: local,
    });
  };

  const loaderClass = buttonLoadingIconStyles();

  const isLeftIconVisible = () => {
    return local.leftIcon && (!styleProps.loading || local.loaderPosition === "right");
  };

  const isRightIconVisible = () => {
    return local.rightIcon && (!styleProps.loading || local.loaderPosition === "left");
  };

  const isLeftLoaderVisible = () => {
    return styleProps.loading && !local.disabled && local.loaderPosition === "left";
  };

  const isRightLoaderVisible = () => {
    return styleProps.loading && !local.disabled && local.loaderPosition === "right";
  };

  const shouldWrapChildrenInSpan = () => {
    return styleProps.loading || local.leftIcon || local.rightIcon;
  };

  return (
    <Dynamic component={local.as} classList={classList()} disabled={local.disabled} {...others}>
      <Show when={isLeftIconVisible()}>{local.leftIcon}</Show>
      <Show when={isLeftLoaderVisible()}>
        <span class={loaderClass}>{local.loader}</span>
      </Show>
      <Show when={local.children}>
        <Show when={shouldWrapChildrenInSpan()} fallback={local.children}>
          <span>{local.children}</span>
        </Show>
      </Show>
      <Show when={isRightIconVisible()}>{local.rightIcon}</Show>
      <Show when={isRightLoaderVisible()}>
        <span class={loaderClass}>{local.loader}</span>
      </Show>
    </Dynamic>
  );
}

Button.toString = () => createCssSelector(hopeButtonClass);
