import { mergeProps, splitProps } from "solid-js";

import { useThemeComponentStyles } from "@/theme";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { alertStyles, AlertVariants } from "./alert.styles";
import { AlertProvider } from "./alert-provider";

export type ThemeableAlertOptions = Pick<AlertVariants, "variant">;

export type AlertProps<C extends ElementType = "div"> = HTMLHopeProps<C, AlertVariants>;

const hopeAlertClass = "hope-alert";

export function Alert<C extends ElementType = "div">(props: AlertProps<C>) {
  const theme = useThemeComponentStyles().Alert;

  const defaultProps: AlertProps<"div"> = {
    variant: theme?.defaultProps?.variant ?? "subtle",
  };

  const propsWithDefault: AlertProps<"div"> = mergeProps(defaultProps, props);
  const [local, variantProps, others] = splitProps(propsWithDefault, ["class"], ["variant", "status"]);

  const classes = () => classNames(local.class, hopeAlertClass, alertStyles(variantProps));

  return (
    <AlertProvider status={variantProps.status}>
      <Box role="alert" class={classes()} __baseStyle={theme?.baseStyle} {...others} />
    </AlertProvider>
  );
}

Alert.toString = () => createClassSelector(hopeAlertClass);
