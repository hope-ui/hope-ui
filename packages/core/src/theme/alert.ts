import { ComponentConfig } from "./component";

export interface AlertVariants {
  variant?: "solid" | "subtle" | "left-accent" | "top-accent";
  status?: "success" | "info" | "warning" | "danger";
}

export type AlertConfig = ComponentConfig<AlertVariants>;

export const defaultAlertConfig: AlertConfig = {
  defaultVariants: {
    variant: "subtle",
    status: "info",
  },
};
