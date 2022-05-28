import clsx from "clsx";
import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { createComponentWithAs, PropsWithAs } from "../factory";

type ButtonIconComponentProps = PropsWithAs<"span">;

const baseClass = "hope-button__icon";

function ButtonIconComponent(props: ButtonIconComponentProps) {
  const [local, others] = splitProps(props, ["as", "class", "children"]);

  const classes = () => {
    return clsx(local.class, baseClass);
  };

  return (
    <Dynamic component={local.as ?? "span"} class={classes()} {...others}>
      {local.children}
    </Dynamic>
  );
}

export const ButtonIcon = createComponentWithAs<"span">(ButtonIconComponent);
