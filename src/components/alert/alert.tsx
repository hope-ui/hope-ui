import { mergeProps, splitProps } from "solid-js";

import { useTheme } from "@/theme";
import { classNames, createCssSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";
import { alertStyles, AlertVariants } from "./alert.styles";
import { AlertProvider } from "./alert-provider";

export type ThemeableAlertOptions = Pick<AlertVariants, "variant">;

export type AlertProps<C extends ElementType> = HopeComponentProps<C, AlertVariants>;

const hopeAlertClass = "hope-alert";

export function Alert<C extends ElementType = "div">(props: AlertProps<C>) {
  const theme = useTheme().components.Alert;

  const defaultProps: AlertProps<"div"> = {
    variant: theme?.defaultProps?.variant ?? "subtle",
  };

  const propsWithDefault: AlertProps<"div"> = mergeProps(defaultProps, props);
  const [local, variantProps, others] = splitProps(
    propsWithDefault,
    ["class"],
    ["variant", "status"]
  );

  const classes = () => classNames(local.class, hopeAlertClass, alertStyles(variantProps));

  return (
    <AlertProvider status={variantProps.status}>
      <Box role="alert" class={classes()} __baseStyle={theme?.baseStyle} {...others} />
    </AlertProvider>
  );
}

Alert.toString = () => createCssSelector(hopeAlertClass);
