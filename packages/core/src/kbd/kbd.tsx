import clsx from "clsx";
import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { createComponentWithAs, PropsWithAs } from "../factory";

export type KbdComponentProps = PropsWithAs<"kbd">;

const baseClass = "hope-kbd";

function KbdComponent(props: KbdComponentProps) {
  const [local, others] = splitProps(props, ["as", "class"]);

  const classes = () => clsx(local.class, baseClass);

  return <Dynamic component={local.as ?? "kbd"} class={classes()} {...others} />;
}

/**
 * Semantic component to render a keyboard shortcut within an application.
 */
export const Kbd = createComponentWithAs<"kbd">(KbdComponent);
