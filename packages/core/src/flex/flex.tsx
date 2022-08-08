import {
  ComponentTheme,
  createPolymorphicComponent,
  createStyles,
  DefaultProps,
  hope,
  PartsOf,
  SystemStyleProps,
  useComponentDefaultProps,
} from "@hope-ui/styles";
import { clsx } from "clsx";

import { splitDefaultProps } from "../utils";

export interface FlexStylesParams {
  /** Shorthand for `flexDirection` style prop. */
  direction?: SystemStyleProps["flexDirection"];

  /** Shorthand for `alignItems` style prop. */
  align?: SystemStyleProps["alignItems"];

  /** Shorthand for `justifyContent` style prop. */
  justify?: SystemStyleProps["justifyContent"];

  /** Shorthand for `flexWrap` style prop. */
  wrap?: SystemStyleProps["flexWrap"];
}

const useStyles = createStyles((theme, params: FlexStylesParams) => ({
  root: {
    display: "flex",
    flexDirection: params.direction,
    alignItems: params.align,
    justifyContent: params.justify,
    flexWrap: params.wrap,
  },
}));

export type FlexParts = PartsOf<typeof useStyles>;

export type FlexProps = DefaultProps<FlexParts, FlexStylesParams> & FlexStylesParams;

export type FlexTheme = ComponentTheme<FlexProps, FlexParts, FlexStylesParams>;

/**
 * `Flex` is used to create flexbox layouts.
 * It renders a `div` with `display: flex` and comes with helpful style shorthand.
 */
export const Flex = createPolymorphicComponent<"div", FlexProps>(props => {
  props = useComponentDefaultProps("Flex", {}, props);

  const [local, others] = splitDefaultProps(props, [
    "class",
    "direction",
    "align",
    "justify",
    "wrap",
  ]);

  const { styles } = useStyles(local, {
    name: "Flex",
    styles: () => local.styles,
    unstyled: () => local.unstyled,
  });

  return <hope.div class={clsx("hope-flex", local.class)} __css={styles().root} {...others} />;
});
