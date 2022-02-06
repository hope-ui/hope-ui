import { splitProps } from "solid-js";

import { classNames, createCssSelector } from "@/utils/css";

import { Icon, IconProps } from "../icon/icon";
import { ElementType } from "../types";
import { tagLeftIconStyles, tagRightIconStyles } from "./tag.styles";

const hopeTagLeftIconClass = "hope-tag-left-icon";

export function TagLeftIcon<C extends ElementType = "svg">(props: IconProps<C>) {
  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, tagLeftIconStyles());

  return <Icon class={classes()} {...others} />;
}

TagLeftIcon.toString = () => createCssSelector(hopeTagLeftIconClass);

const hopeTagRightIconClass = "hope-tag-right-icon";

export function TagRightIcon<C extends ElementType = "svg">(props: IconProps<C>) {
  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, tagRightIconStyles());

  return <Icon class={classes()} {...others} />;
}

TagRightIcon.toString = () => createCssSelector(hopeTagRightIconClass);
