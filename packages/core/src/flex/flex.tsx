import { createPolymorphicComponent, hope, SystemStyleProps } from "@hope-ui/styles";
import { splitProps } from "solid-js";

export interface FlexProps {
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
  const [local, others] = splitProps(props, ["direction", "align", "justify", "wrap"]);

  return (
    <hope.div
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
