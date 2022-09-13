import { ComponentTheme, HopeProps, SystemStyleProps } from "@hope-ui/styles";
import { Accessor, JSX } from "solid-js";

import { ButtonStyleConfigProps } from "./button.styles";

export interface ButtonProps extends ButtonStyleConfigProps {
  /** The placement of the loader when `isLoading` is true. */
  loaderPlacement?: "start" | "end";

  /** Whether the button is in a loading state. */
  isLoading?: boolean;

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
  hasLoadingText?: boolean;
}

export type ButtonContentProps = Pick<ButtonProps, "leftIcon" | "rightIcon" | "children">;

export type ButtonTheme = ComponentTheme<
  ButtonProps,
  "colorScheme" | "variant" | "size" | "loaderPlacement"
>;

export interface IconButtonProps
  extends Omit<
    ButtonProps,
    | "loadingText"
    | "loaderPlacement"
    | "leftIcon"
    | "rightIcon"
    | "isFullWidth"
    | "isIconButton"
    | "children"
  > {
  /** A label that describes the button. */
  "aria-label": string;

  /** The icon to be used in the button. */
  icon?: JSX.Element;

  /** The icon to be used in the button. */
  children?: JSX.Element;
}
