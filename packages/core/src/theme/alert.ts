import { ComponentConfig } from "./component";

export interface AlertVariants {
  /** The visual style of the alert. */
  variant?: "solid" | "subtle" | "left-accent" | "top-accent";

  /** The color of the alert. */
  status?: "success" | "info" | "warning" | "danger";
}

export type AlertConfig = ComponentConfig<AlertVariants>;

export const defaultAlertConfig: AlertConfig = {
  defaultVariants: {
    variant: "subtle",
    status: "info",
  },
};
