import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { ElementType, PolymorphicComponentProps } from "../types";
import { commonProps } from "../utils";
import { centerStyles, CenterVariants } from "./Center.styles";

export type CenterProps<C extends ElementType> = PolymorphicComponentProps<C, CenterVariants>;

/**
 * Center is a layout component that centers its child within itself.
 */
export function Center<C extends ElementType = "div">(props: CenterProps<C>) {
  const [local, others] = splitProps(props, [
    ...commonProps,
    "fullWidth",
    "fullHeight",
    "fullSize",
  ]);

  const classList = () => {
    const centerClass = centerStyles({
      fullWidth: local.fullWidth,
      fullHeight: local.fullHeight,
      fullSize: local.fullSize,
      css: local.css,
    });

    return {
      [centerClass]: true,
      [local.class ?? ""]: true,
      [local.className ?? ""]: true,
      ...local.classList,
    };
  };

  return <Dynamic component={local.as ?? "div"} classList={classList()} {...others} />;
}
