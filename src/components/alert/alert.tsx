import { mergeProps, splitProps } from "solid-js";

import { SystemStyleObject } from "@/styled-system";
import { useComponentStyleConfigs } from "@/theme";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { alertStyles, AlertVariants } from "./alert.styles";
import { AlertProvider } from "./alert-provider";

export interface AlertStyleConfig {
  baseStyle?: {
    root?: SystemStyleObject;
    icon?: SystemStyleObject;
    title?: SystemStyleObject;
    description?: SystemStyleObject;
  };
  defaultProps?: {
    root?: Pick<AlertVariants, "variant" | "status">;
  };
}

export type AlertProps<C extends ElementType = "div"> = HTMLHopeProps<C, AlertVariants>;

const hopeAlertClass = "hope-alert";

export function Alert<C extends ElementType = "div">(props: AlertProps<C>) {
  const theme = useComponentStyleConfigs().Alert;

  const defaultProps: AlertProps<"div"> = {
    variant: theme?.defaultProps?.root?.variant ?? "subtle",
    status: theme?.defaultProps?.root?.status,
  };

  const propsWithDefault: AlertProps<"div"> = mergeProps(defaultProps, props);
  const [local, variantProps, others] = splitProps(propsWithDefault, ["class"], ["variant", "status"]);

  const classes = () => classNames(local.class, hopeAlertClass, alertStyles(variantProps));

  return (
    <AlertProvider status={variantProps.status}>
      <Box role="alert" class={classes()} __baseStyle={theme?.baseStyle?.root} {...others} />
    </AlertProvider>
  );
}

Alert.toString = () => createClassSelector(hopeAlertClass);
