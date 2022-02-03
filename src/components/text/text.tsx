import { splitProps } from "solid-js";

import { Box } from "@/components/box";
import { HopeComponentProps } from "@/components/types";
import { classNames, createCssSelector } from "@/utils/css";
import { ElementType } from "@/utils/types";

import { baseTextStyles, BaseTextVariants } from "./text.styles";

export type BaseTextProps<C extends ElementType> = HopeComponentProps<C, BaseTextVariants>;

/**
 * [Internal] Foundation of <Text /> and <Heading /> components.
 */
export function BaseText<C extends ElementType = "p">(props: BaseTextProps<C>) {
  const [local, variantProps, others] = splitProps(props, ["class"], ["size"]);

  const classes = () => classNames(local.class, baseTextStyles(variantProps));

  return <Box as="p" class={classes()} {...others} />;
}

/* -------------------------------------------------------------------------------------------------
 * Text
 * -----------------------------------------------------------------------------------------------*/

const hopeTextClass = "hope-text";

/**
 * Text component is the used to render text and paragraphs within an interface.
 * It renders a <p> tag by default.
 */
export function Text<C extends ElementType = "p">(props: BaseTextProps<C>) {
  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeTextClass);

  return <BaseText class={classes()} {...others} />;
}

Text.toString = () => createCssSelector(hopeTextClass);
