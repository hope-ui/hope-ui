import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import {
  styledSystemStyles,
  StyledSystemVariants,
  styledSystemVariantsKeys,
} from "@/styled-system/system.styles";
import { generateClassList } from "@/utils/function";
import { classPropsKeys } from "@/utils/object";

import { ElementType, HopeComponentProps } from "../types";

/**
 * Box is the most abstract component of Hope UI.
 * By default, it renders a div element.
 */
export function Box<C extends ElementType = "div">(props: HopeComponentProps<C>) {
  const variantPropsKeys = Object.keys(props).filter(
    key => key in styledSystemVariantsKeys
  ) as Array<keyof StyledSystemVariants>;

  const [local, variantProps, others] = splitProps(
    props,
    [...classPropsKeys, "as"],
    [...variantPropsKeys, "css"]
  );

  const classList = () => {
    return generateClassList({
      hopeClass: "", // No semantic class because it will be added to all components
      baseClass: styledSystemStyles(variantProps),
      classProps: local,
    });
  };

  return <Dynamic component={local.as ?? "div"} classList={classList()} {...others} />;
}
