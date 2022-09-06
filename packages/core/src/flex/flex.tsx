/*!
 * Original code by Chakra UI
 * MIT Licensed, Copyright (c) 2019 Segun Adebayo.
 *
 * Credits to the Chakra UI team:
 * https://github.com/chakra-ui/chakra-ui/blob/main/packages/layout/src/flex.tsx
 */

import { createHopeComponent, hope, SystemStyleProps } from "@hope-ui/styles";
import { clsx } from "clsx";
import { splitProps } from "solid-js";

export interface FlexProps {
  /** Shorthand for `flexDirection` style prop. */
  direction?: SystemStyleProps["flexDirection"];

  /** Shorthand for `flexWrap` style prop. */
  wrap?: SystemStyleProps["flexWrap"];

  /** Shorthand for `alignItems` style prop. */
  align?: SystemStyleProps["alignItems"];

  /** Shorthand for `justifyContent` style prop. */
  justify?: SystemStyleProps["justifyContent"];
}

/**
 * `Flex` is used to create flexbox layouts.
 * It renders a `div` with `display: flex` and comes with helpful style shorthand.
 */
export const Flex = createHopeComponent<"div", FlexProps>(props => {
  const [local, others] = splitProps(props, ["class", "direction", "wrap", "align", "justify"]);

  return (
    <hope.div
      class={clsx("hope-Flex-root", local.class)}
      __css={{
        display: "flex",
        flexDirection: local.direction,
        flexWrap: local.wrap,
        alignItems: local.align,
        justifyContent: local.justify,
      }}
      {...others}
    />
  );
});
