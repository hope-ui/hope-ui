import { JSX, mergeProps, Show, splitProps } from "solid-js";

import { useColorMode } from "@/color-mode/ColorModeProvider";
import { IconSpinner } from "@/icons/IconSpinner";
import { StyledSystemVariants } from "@/styled-system/system.styles";
import { useTheme } from "@/theme/HopeProvider";
import { XPosition } from "@/theme/types";
import { createCssSelector, generateClassList } from "@/utils/function";
import { classPropsKeys } from "@/utils/object";

import { Box } from "../Box/Box";
import { ElementType, ExtendableProps, HopeComponentProps } from "../types";
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
  "variant" | "colorScheme" | "size" | "loaderPosition" | "compact" | "fullWidth"
> &
  Pick<StyledSystemVariants, "borderRadius" | "textTransform">;

export type ButtonProps<C extends ElementType> = HopeComponentProps<C, ButtonOptions>;

const hopeButtonClass = "hope-button";

/**
 * The Button component is used to trigger an action or event,
 * such as submitting a form, opening a dialog, canceling an action, or performing a delete operation.
 */
export function Button<C extends ElementType = "button">(props: ButtonProps<C>) {
  const defaultButtonProps = useTheme().components.Button?.defaultProps;

  const { colorMode } = useColorMode();

  const defaultProps: ExtendableProps<ButtonProps<"button">, Required<ThemeableButtonOptions>> = {
    as: "button",
    variant: defaultButtonProps?.variant ?? "solid",
    colorScheme: defaultButtonProps?.colorScheme ?? "primary",
    size: defaultButtonProps?.size ?? "md",
    borderRadius: defaultButtonProps?.borderRadius ?? "sm",
    loaderPosition: defaultButtonProps?.loaderPosition ?? "left",
    compact: defaultButtonProps?.compact ?? false,
    textTransform: defaultButtonProps?.textTransform ?? "none",
    fullWidth: defaultButtonProps?.fullWidth ?? false,
    loader: <IconSpinner />,
    loading: false,
    disabled: false,
    type: "button",
    role: "button",
  };

  const propsWithDefault: ButtonProps<C> = mergeProps(defaultProps, props);
  const [local, variantProps, others] = splitProps(
    propsWithDefault,
    [
      ...classPropsKeys,
      "loader",
      "loaderPosition",
      "disabled",
      "leftIcon",
      "rightIcon",
      "children",
    ],
    ["variant", "colorScheme", "size", "loading", "compact", "fullWidth"]
  );

  const classList = () => {
    return generateClassList({
      hopeClass: hopeButtonClass,
      baseClass: buttonStyles({
        darkMode: colorMode() === "dark",
        ...variantProps,
      }),
      classProps: local,
    });
  };

  const loaderClass = buttonLoadingIconStyles();

  const isLeftIconVisible = () => {
    return local.leftIcon && (!variantProps.loading || local.loaderPosition === "right");
  };

  const isRightIconVisible = () => {
    return local.rightIcon && (!variantProps.loading || local.loaderPosition === "left");
  };

  const isLeftLoaderVisible = () => {
    return variantProps.loading && !local.disabled && local.loaderPosition === "left";
  };

  const isRightLoaderVisible = () => {
    return variantProps.loading && !local.disabled && local.loaderPosition === "right";
  };

  const shouldWrapChildrenInSpan = () => {
    return variantProps.loading || local.leftIcon || local.rightIcon;
  };

  return (
    <Box classList={classList()} disabled={local.disabled} {...others}>
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
    </Box>
  );
}

Button.toString = () => createCssSelector(hopeButtonClass);
