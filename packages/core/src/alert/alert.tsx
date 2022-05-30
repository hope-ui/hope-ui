import { withBemModifiers } from "@hope-ui/utils";
import clsx from "clsx";
import { Accessor, createContext, mergeProps, splitProps, useContext } from "solid-js";
import { Dynamic } from "solid-js/web";

import { createComponentWithAs, PropsWithAs } from "../factory";
import { useComponentConfig } from "../provider";
import { AlertVariants } from "../theme";

export type AlertComponentProps = PropsWithAs<"div", AlertVariants>;

const baseClass = "hope-alert";

function AlertComponent(props: AlertComponentProps) {
  const config = useComponentConfig("Alert");

  const defaultProps: AlertComponentProps = {
    as: "div",
    variant: config.defaultVariants?.variant,
    status: config.defaultVariants?.status,
  };

  // eslint-disable-next-line solid/reactivity
  props = mergeProps(defaultProps, props);
  const [local, others] = splitProps(props, ["as", "class", "variant", "status"]);

  const classes = () => {
    return clsx(local.class, baseClass, withBemModifiers(baseClass, [local.variant, local.status]));
  };

  const context: AlertContextValue = {
    variants: () => local,
  };

  return (
    <AlertContext.Provider value={context}>
      <Dynamic component={local.as} role="alert" class={classes()} {...others} />
    </AlertContext.Provider>
  );
}

/**
 * Alert is used to communicate the state or status of a page, feature or action
 */
export const Alert = createComponentWithAs<"div", AlertVariants>(AlertComponent);

/* -------------------------------------------------------------------------------------------------
 * Context
 * -----------------------------------------------------------------------------------------------*/

interface AlertContextValue {
  variants: Accessor<AlertVariants>;
}

const AlertContext = createContext<AlertContextValue>();

export function useAlertContext() {
  const context = useContext(AlertContext);

  if (!context) {
    throw new Error("[Hope UI]: useAlertContext must be used within an `Alert` component");
  }

  return context;
}
