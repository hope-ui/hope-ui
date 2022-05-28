import { ComponentConfig } from "./component";

export interface ButtonVariants {
  /** The visual style of the button. */
  variant?: "solid" | "subtle" | "outline" | "dashed" | "ghost" | "default";

  /** The color of the button. */
  colorScheme?:
    | "primary"
    | "accent"
    | "dark"
    | "neutral"
    | "success"
    | "info"
    | "warning"
    | "danger";

  /** The size of the button. */
  size?: "xs" | "sm" | "md" | "lg" | "xl";

  /** The placement of the loader when `isLoading` is true. */
  loaderPlacement?: "start" | "end";
}

export type ButtonConfig = ComponentConfig<ButtonVariants>;

export const defaultButtonConfig: ButtonConfig = {
  defaultVariants: {
    variant: "default",
    size: "sm",
    loaderPlacement: "start",
  },
};
