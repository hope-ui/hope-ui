import { ComponentConfig } from "./component";

export interface ButtonVariants {
  variant?: "solid" | "subtle" | "outline" | "dashed" | "ghost" | "default";
  colorScheme?:
    | "primary"
    | "accent"
    | "dark"
    | "neutral"
    | "success"
    | "info"
    | "warning"
    | "danger";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

export type ButtonConfig = ComponentConfig<ButtonVariants>;

export const defaultButtonConfig: ButtonConfig = {
  defaultVariants: {
    variant: "default",
    size: "sm",
  },
};
