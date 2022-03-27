import { Accessor, createContext, mergeProps, splitProps, useContext } from "solid-js";

import { SystemStyleObject } from "@/styled-system/types";
import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { alertStyles, AlertVariants } from "./alert.styles";

export type AlertProps<C extends ElementType = "div"> = HTMLHopeProps<C, AlertVariants>;

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

type AlertContextValue = {
  status: Accessor<AlertVariants["status"]>;
};

const AlertContext = createContext<AlertContextValue>();

const hopeAlertClass = "hope-alert";

export function Alert<C extends ElementType = "div">(props: AlertProps<C>) {
  const theme = useComponentStyleConfigs().Alert;

  const defaultProps: AlertProps<"div"> = {
    variant: theme?.defaultProps?.root?.variant ?? "subtle",
    status: theme?.defaultProps?.root?.status ?? "info",
  };

  const propsWithDefault: AlertProps<"div"> = mergeProps(defaultProps, props);
  const [local, variantProps, others] = splitProps(propsWithDefault, ["class"], ["variant", "status"]);

  const classes = () => classNames(local.class, hopeAlertClass, alertStyles(variantProps));

  const alertStatus = () => variantProps.status;

  const context: AlertContextValue = {
    status: alertStatus,
  };

  return (
    <AlertContext.Provider value={context}>
      <Box role="alert" class={classes()} __baseStyle={theme?.baseStyle?.root} {...others} />
    </AlertContext.Provider>
  );
}

Alert.toString = () => createClassSelector(hopeAlertClass);

export function useAlertContext() {
  const context = useContext(AlertContext);

  if (!context) {
    throw new Error("[Hope UI]: useAlertContext must be used within an `<Alert />` component");
  }

  return context;
}
