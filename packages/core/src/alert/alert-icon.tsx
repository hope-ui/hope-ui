import clsx from "clsx";
import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { createComponentWithAs, ElementType, PropsWithAs } from "../factory";
import { IconCheckCircleSolid } from "../icons/IconCheckCircleSolid";
import { IconExclamationCircleSolid } from "../icons/IconExclamationCircleSolid";
import { IconExclamationTriangleSolid } from "../icons/IconExclamationTriangleSolid";
import { IconInfoCircleSolid } from "../icons/IconInfoCircleSolid";
import { useAlertContext } from "./alert";

type AlertIconComponentProps = PropsWithAs<{}, "svg">;

function AlertIconComponent(props: AlertIconComponentProps) {
  const { variants } = useAlertContext();

  const [local, others] = splitProps(props, ["as", "class"]);

  const classes = () => clsx(local.class, "hope-alert-icon");

  const icon = () => {
    if (local.as) {
      return local.as as ElementType;
    }

    switch (variants().status) {
      case "success":
        return IconCheckCircleSolid;
      case "info":
        return IconInfoCircleSolid;
      case "warning":
        return IconExclamationTriangleSolid;
      case "danger":
        return IconExclamationCircleSolid;
      default:
        return IconInfoCircleSolid;
    }
  };

  return <Dynamic component={icon()} class={classes()} {...others} />;
}

export const AlertIcon = createComponentWithAs<{}, "svg">(AlertIconComponent);
