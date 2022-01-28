import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { boxPropNames } from "../Box/Box.styles";
import { ElementType, PolymorphicComponentProps } from "../types";
import { commonProps, createCssSelector, generateClassList } from "../utils";
import { textStyles, TextVariants } from "./Text.styles";

export type TextOptions = TextVariants & {
  size?: TextVariants["fontSize"];
};

export type TextProps<C extends ElementType> = PolymorphicComponentProps<C, TextOptions>;

const hopeTextClass = "hope-text";

/**
 * Text component is the used to render text and paragraphs within an interface.
 * It renders a <p> tag by default.
 */
export function Text<C extends ElementType = "p">(props: TextProps<C>) {
  const [local, styleProps, others] = splitProps(props, commonProps, [
    ...boxPropNames,
    "css",
    "size",
  ]);

  const classList = () => {
    return generateClassList({
      hopeClass: hopeTextClass,
      baseClass: textStyles({
        ...styleProps,
        fontSize: styleProps.size,
      }),
      class: local.class,
      className: local.className,
      classList: local.classList,
    });
  };

  return <Dynamic component={local.as ?? "p"} classList={classList()} {...others} />;
}

Text.toString = () => createCssSelector(hopeTextClass);
