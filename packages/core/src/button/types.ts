import { ComponentTheme, HopeProps, SystemStyleProps } from "@hope-ui/styles";
import { Accessor, JSX } from "solid-js";

import { ButtonRecipeProps } from "./button.styles";

export interface ButtonProps extends ButtonRecipeProps {
  /** The placement of the loader when `isLoading` is true. */
  loaderPlacement?: "start" | "end";

  /** Whether the button should be disabled. */
  isDisabled?: boolean;

  /** The label to show in the button when `loading` is true. */
  loadingText?: string;

  /** Replace the loader component when `isLoading` is set to `true`. */
  loader?: JSX.Element;

  /** If added, the button will show an icon before the button's label. */
  leftIcon?: JSX.Element;

  /** If added, the button will show an icon after the button's label. */
  rightIcon?: JSX.Element;

  /** The content of the button. */
  children?: JSX.Element;
}

export interface ButtonLoaderProps {
  /** Whether a loading text should be displayed next to the loader icon. */
  withLoadingText?: boolean;
}

export type ButtonContentProps = Pick<ButtonProps, "leftIcon" | "rightIcon" | "children">;

interface ButtonGroupProps
  extends Pick<ButtonProps, "variant" | "colorScheme" | "size" | "isDisabled">,
    HopeProps {
  /** Whether the borderRadius of button that are direct children will be altered to look flushed together. */
  isAttached?: boolean;

  /** The spacing between each button. */
  spacing?: SystemStyleProps["marginRight"];
}

export interface ButtonGroupContextValue {
  variant: Accessor<ButtonGroupProps["variant"]>;
  colorScheme: Accessor<ButtonGroupProps["colorScheme"]>;
  size: Accessor<ButtonGroupProps["size"]>;
  isDisabled: Accessor<ButtonGroupProps["isDisabled"]>;
}

export type ButtonTheme = ComponentTheme<ButtonProps, ButtonProps["styles"]>;
