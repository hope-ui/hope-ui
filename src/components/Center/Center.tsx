import { splitProps } from "solid-js";

import { css } from "@/styled-system/stitches.config";

import { Box, BoxProps, ElementType } from "..";

export type CenterProps<C extends ElementType> = Omit<BoxProps<C>, "justifyContent" | "alignItems">;

const centerCssComponent = css({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

/**
 * Center is a layout component that centers its child within itself.
 *
 * @param props {@link CenterProps}
 */
export function Center<C extends ElementType>(props: CenterProps<C>) {
  const [local, others] = splitProps(props, ["className"]);

  const className = () => `${centerCssComponent} ${local.className}`;

  return <Box className={className()} {...others} />;
}

Center.className = centerCssComponent.className;
Center.toString = () => centerCssComponent.selector;
