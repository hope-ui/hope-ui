import { mergeProps, splitProps } from "solid-js";

import { classNames, createCssSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";
import { anchorStyles } from "./anchor.styles";

interface AnchorOptions {
  external?: boolean;
}

export type AnchorProps<C extends ElementType> = HopeComponentProps<C, AnchorOptions>;

const hopeAnchorClass = "hope-anchor";

/**
 * Anchors are accessible elements used primarily for navigation.
 * This component is styled to resemble a hyperlink and semantically renders an <a>.
 */
export function Anchor<C extends ElementType = "a">(props: AnchorProps<C>) {
  const defaultProps: AnchorProps<"a"> = {
    as: "a",
  };

  const propsWithDefault: AnchorProps<"a"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, ["class", "external"]);

  const classes = () => classNames(local.class, hopeAnchorClass, anchorStyles());

  return (
    <Box
      class={classes()}
      target={local.external ? "_blank" : undefined}
      rel={local.external ? "noopener noreferrer" : undefined}
      {...others}
    />
  );
}

Anchor.toString = () => createCssSelector(hopeAnchorClass);
