import { splitProps } from "solid-js";

import { classNames } from "@/utils/css";

import { Icon, IconProps } from "../icon/icon";
import { ElementType } from "../types";
import { tagLeftIconStyles, tagRightIconStyles } from "./tag.styles";

export function TagRightIcon<C extends ElementType = "svg">(props: IconProps<C>) {
  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, tagRightIconStyles());

  return <Icon class={classes()} {...others} />;
}

export function TagLeftIcon<C extends ElementType = "svg">(props: IconProps<C>) {
  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, tagLeftIconStyles());

  return <Icon class={classes()} {...others} />;
}
