import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { utilityStyleProps } from "@/theme/utilityStyles";

import { ElementType, PolymorphicComponentProps } from "../types";
import { commonProps, createCssSelector, generateClassList } from "../utils";
import { commonTextStyleProps, textStyles, TextVariants } from "./Text.styles";

export type TextOptions = Omit<TextVariants, "fontSize" | "fontFamily" | "fontWeight"> & {
  size?: TextVariants["fontSize"];
  font?: TextVariants["fontFamily"];
  weight?: TextVariants["fontWeight"];
};

export type TextProps<C extends ElementType> = PolymorphicComponentProps<C, TextOptions>;

/**
 * Used to splitProps in <Text/> and <Heading/> component.
 */
export const textStyleProps: Array<keyof TextOptions> = [
  ...commonTextStyleProps,
  "size",
  "font",
  "weight",
];

const hopeTextClass = "hope-text";

/**
 * Text component is the used to render text and paragraphs within an interface.
 * It renders a <p> tag by default.
 */
export function Text<C extends ElementType = "p">(props: TextProps<C>) {
  const [local, styleProps, others] = splitProps(props, commonProps, [
    ...utilityStyleProps,
    ...textStyleProps,
    "css",
  ]);

  const classList = () => {
    return generateClassList({
      hopeClass: hopeTextClass,
      baseClass: textStyles({
        ...styleProps,
        fontSize: styleProps.size,
        fontFamily: styleProps.font,
        fontWeight: styleProps.weight,
      }),
      class: local.class,
      className: local.className,
      classList: local.classList,
    });
  };

  return <Dynamic component={local.as ?? "p"} classList={classList()} {...others} />;
}

Text.toString = () => createCssSelector(hopeTextClass);
