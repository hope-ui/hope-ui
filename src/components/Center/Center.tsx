import { splitProps } from "solid-js";

import { createCssSelector, generateClassList } from "@/utils/function";
import { classPropsKeys } from "@/utils/object";

import { Box } from "../Box/Box";
import { ElementType, HopeComponentProps } from "../types";
import { centerStyles } from "./Center.styles";

const hopeCenterClass = "hope-center";

/**
 * Center is a layout component that centers its child within itself.
 */
export function Center<C extends ElementType = "div">(props: HopeComponentProps<C>) {
  const [local, others] = splitProps(props, classPropsKeys);

  const classList = () => {
    return generateClassList({
      hopeClass: hopeCenterClass,
      baseClass: centerStyles(),
      classProps: local,
    });
  };

  return <Box classList={classList()} {...others} />;
}

Center.toString = () => createCssSelector(hopeCenterClass);
