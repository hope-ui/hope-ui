import { splitProps } from "solid-js";

import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { hope } from "../factory";
import { ElementType, HTMLHopeProps, SinglePartComponentStyleConfig } from "../types";
import { anchorStyles } from "./anchor.styles";

export type AnchorStyleConfig = SinglePartComponentStyleConfig<void>;

interface AnchorOptions {
  external?: boolean;
}

export type AnchorProps<C extends ElementType = "a"> = HTMLHopeProps<C, AnchorOptions>;

const hopeAnchorClass = "hope-anchor";

/**
 * Anchors are accessible elements used primarily for navigation.
 * This component is styled to resemble a hyperlink and semantically renders an <a>.
 */
export function Anchor<C extends ElementType = "a">(props: AnchorProps<C>) {
  const theme = useComponentStyleConfigs().Anchor;

  const [local, others] = splitProps(props, ["class", "external"]);

  const classes = () => classNames(local.class, hopeAnchorClass, anchorStyles());

  return (
    <hope.a
      class={classes()}
      __baseStyle={theme?.baseStyle}
      target={local.external ? "_blank" : undefined}
      rel={local.external ? "noopener noreferrer" : undefined}
      {...others}
    />
  );
}

Anchor.toString = () => createClassSelector(hopeAnchorClass);
