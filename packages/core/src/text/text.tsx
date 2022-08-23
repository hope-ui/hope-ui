import { createHopeComponent, hope, mergeThemeProps, ResponsiveValue } from "@hope-ui/styles";
import { clsx } from "clsx";
import { createMemo, splitProps } from "solid-js";

import { lineClamp } from "../utils";
import { TextStyleConfigProps, useStyleConfig } from "./text.styles";

export interface TextProps extends TextStyleConfigProps {
  /** The number of lines the text should be truncate. */
  lineClamp?: ResponsiveValue<number>;
}

/**
 * Text component is the used to render text and paragraphs within an interface.
 * It renders a <p> tag by default.
 */
export const Text = createHopeComponent<"p", TextProps>(props => {
  props = mergeThemeProps("Text", {}, props);

  const [local, styleConfigProps, others] = splitProps(
    props,
    ["class", "lineClamp"],
    ["styleConfigOverrides", "unstyled", "size"]
  );

  const { classes, styleOverrides } = useStyleConfig("Text", styleConfigProps);

  const rootStyleOverrides = createMemo(() => ({
    ...styleOverrides().root,
    ...lineClamp(local.lineClamp),
  }));

  return (
    <hope.p class={clsx(classes().root, local.class)} __css={rootStyleOverrides()} {...others} />
  );
});
