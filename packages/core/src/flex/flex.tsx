/*!
 * Original code by Chakra UI
 * MIT Licensed, Copyright (c) 2019 Segun Adebayo.
 *
 * Credits to the Chakra UI team:
 * https://github.com/chakra-ui/chakra-ui/blob/main/packages/layout/src/flex.tsx
 */

import { createPolymorphicComponent, hope, HopeProps, SystemStyleProps } from "@hope-ui/styles";
import { clsx } from "clsx";
import { splitProps } from "solid-js";

export interface FlexProps extends HopeProps {
  /** Shorthand for `flexDirection` style prop. */
  direction?: SystemStyleProps["flexDirection"];

  /** Shorthand for `alignItems` style prop. */
  align?: SystemStyleProps["alignItems"];

  /** Shorthand for `justifyContent` style prop. */
  justify?: SystemStyleProps["justifyContent"];

  /** Shorthand for `flexWrap` style prop. */
  wrap?: SystemStyleProps["flexWrap"];
}

/**
 * `Flex` is used to create flexbox layouts.
 * It renders a `div` with `display: flex` and comes with helpful style shorthand.
 */
export const Flex = createPolymorphicComponent<"div", FlexProps>(props => {
  const [local, others] = splitProps(props, ["class", "direction", "align", "justify", "wrap"]);

  return (
    <hope.div
      class={clsx("hope-flex", local.class)}
      __css={{
        display: "flex",
        flexDirection: local.direction,
        alignItems: local.align,
        justifyContent: local.justify,
        flexWrap: local.wrap,
      }}
      {...others}
    />
  );
});
