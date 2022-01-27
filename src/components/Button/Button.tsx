import { JSX, mergeProps, Show, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { useHopeTheme } from "@/contexts/HopeContext";
import { IconSpinner } from "@/icons/IconSpinner";
import { HopeXPosition } from "@/theme/types";

import { ElementType, ExtendableProps, PolymorphicComponentProps } from "../types";
import { commonProps, generateClassList } from "../utils";
import { buttonLoadingIconStyles, buttonStyles, ButtonVariants } from "./Button.styles";

export type ButtonOptions = ButtonVariants & {
  disabled?: boolean;
  loaderPosition?: HopeXPosition;
  loader?: JSX.Element;
  leftIcon?: JSX.Element;
  rightIcon?: JSX.Element;
};

export type CommonOmitableButtonOptions = "disabled" | "loading" | "loader";

export type ThemeableButtonOptions = Omit<
  ButtonOptions,
  CommonOmitableButtonOptions | "leftIcon" | "rightIcon"
>;

export type ButtonProps<C extends ElementType> = PolymorphicComponentProps<C, ButtonOptions>;

/**
 * The Button component is used to trigger an action or event,
 * such as submitting a form, opening a dialog, canceling an action, or performing a delete operation.
 */
export function Button<C extends ElementType = "button">(props: ButtonProps<C>) {
  const theme = useHopeTheme().components.Button;

  const defaultProps: ExtendableProps<ButtonProps<"button">, Required<ThemeableButtonOptions>> = {
    as: "button",
    variant: theme?.defaultProps?.variant ?? "filled",
    color: theme?.defaultProps?.color ?? "primary",
    size: theme?.defaultProps?.size ?? "md",
    radius: theme?.defaultProps?.radius ?? "sm",
    loaderPosition: theme?.defaultProps?.loaderPosition ?? "left",
    compact: theme?.defaultProps?.compact ?? false,
    uppercase: theme?.defaultProps?.uppercase ?? false,
    fullWidth: theme?.defaultProps?.fullWidth ?? false,
    loader: <IconSpinner />,
    loading: false,
    disabled: false,
    type: "button",
    role: "button",
  };

  props = mergeProps(defaultProps, props);
  const [local, styleProps, others] = splitProps(
    props,
    [...commonProps, "loader", "loaderPosition", "disabled", "leftIcon", "rightIcon", "children"],
    ["css", "variant", "color", "size", "radius", "loading", "compact", "uppercase", "fullWidth"]
  );

  const classList = () => {
    return generateClassList({
      baseClass: buttonStyles(styleProps),
      class: local.class,
      className: local.className,
      classList: local.classList,
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
        <span className={loaderClass}>{local.loader}</span>
      </Show>
      <Show when={local.children}>
        <Show when={shouldWrapChildrenInSpan()} fallback={local.children}>
          <span>{local.children}</span>
        </Show>
      </Show>
      <Show when={isRightIconVisible()}>{local.rightIcon}</Show>
      <Show when={isRightLoaderVisible()}>
        <span className={loaderClass}>{local.loader}</span>
      </Show>
    </Dynamic>
  );
}
