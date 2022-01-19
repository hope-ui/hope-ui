import { css } from "@stitches/core";
import { splitProps } from "solid-js";

import { Box, BoxProps, ElementType } from "..";

export type CenterProps<C extends ElementType> = Omit<BoxProps<C>, "justifyContent" | "alignItems">;

const centerCssComponent = css();

/**
 * Center is a layout component that centers its child within itself.
 *
 * @param props {@link CenterProps}
 */
export function Center<C extends ElementType>(props: CenterProps<C>) {
  const [local, others] = splitProps(props, ["className"]);

  const className = () => `${centerCssComponent} ${local.className}`;

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      className={className()}
      {...others}
    />
  );
}

Center.className = centerCssComponent.className;
Center.toString = () => centerCssComponent.selector;
