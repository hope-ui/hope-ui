import { mergeProps, splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";
import { tagLabelStyles } from "./tag.styles";

export type TagLabelProps<C extends ElementType = "span"> = HopeComponentProps<C>;

const hopeTagLabelClass = "hope-tag-label";

export function TagLabel<C extends ElementType = "span">(props: TagLabelProps<C>) {
  const defaultProps: TagLabelProps<"span"> = {
    as: "span",
  };

  const propsWithDefault: TagLabelProps<"span"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, ["class"]);

  const classes = () => classNames(local.class, hopeTagLabelClass, tagLabelStyles());

  return <Box class={classes()} {...others} />;
}

TagLabel.toString = () => createClassSelector(hopeTagLabelClass);
