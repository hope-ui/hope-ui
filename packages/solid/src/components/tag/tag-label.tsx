import { splitProps } from "solid-js";

import { useStyleConfig } from "../../hope-provider";
import { classNames, createClassSelector } from "../../utils/css";
import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";
import { tagLabelStyles } from "./tag.styles";

export type TagLabelProps<C extends ElementType = "span"> = HTMLHopeProps<C>;

const hopeTagLabelClass = "hope-tag-label";

export function TagLabel<C extends ElementType = "span">(props: TagLabelProps<C>) {
  const theme = useStyleConfig().Tag;

  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeTagLabelClass, tagLabelStyles());

  return <hope.span class={classes()} __baseStyle={theme?.baseStyle?.label} {...others} />;
}

TagLabel.toString = () => createClassSelector(hopeTagLabelClass);
