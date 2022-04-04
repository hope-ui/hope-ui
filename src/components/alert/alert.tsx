import { Accessor, createContext, mergeProps, splitProps, useContext } from "solid-js";

import { SystemStyleObject } from "@/styled-system/types";
import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { alertStyles, AlertVariants } from "./alert.styles";

type ThemeableAlertOptions = AlertVariants;

export type AlertProps<C extends ElementType = "div"> = HTMLHopeProps<C, AlertVariants>;

const hopeAlertClass = "hope-alert";

export function Alert<C extends ElementType = "div">(props: AlertProps<C>) {
  const theme = useComponentStyleConfigs().Alert;

  const defaultProps: AlertProps<"div"> = {
    variant: theme?.defaultProps?.root?.variant ?? "subtle",
    status: theme?.defaultProps?.root?.status ?? "info",
  };

  const propsWithDefault: AlertProps<"div"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, ["class", "variant", "status"]);

  const classes = () => {
    return classNames(
      local.class,
      hopeAlertClass,
      alertStyles({
        variant: local.variant,
        status: local.status,
      })
    );
  };

  const statusAccessor = () => local.status;

  const context: AlertContextValue = {
    status: statusAccessor,
  };

  return (
    <AlertContext.Provider value={context}>
      <Box role="alert" class={classes()} __baseStyle={theme?.baseStyle?.root} {...others} />
    </AlertContext.Provider>
  );
}

Alert.toString = () => createClassSelector(hopeAlertClass);

/* -------------------------------------------------------------------------------------------------
 * Context
 * -----------------------------------------------------------------------------------------------*/

type AlertContextValue = {
  status: Accessor<AlertVariants["status"]>;
};

const AlertContext = createContext<AlertContextValue>();

export function useAlertContext() {
  const context = useContext(AlertContext);

  if (!context) {
    throw new Error("[Hope UI]: useAlertContext must be used within an `<Alert />` component");
  }

  return context;
}

/* -------------------------------------------------------------------------------------------------
 * StyleConfig
 * -----------------------------------------------------------------------------------------------*/

export interface AlertStyleConfig {
  baseStyle?: {
    root?: SystemStyleObject;
    icon?: SystemStyleObject;
    title?: SystemStyleObject;
    description?: SystemStyleObject;
  };
  defaultProps?: {
    root?: ThemeableAlertOptions;
  };
}
