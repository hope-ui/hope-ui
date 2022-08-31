import {
  ComponentTheme,
  createHopeComponent,
  hope,
  mergeThemeProps,
  ResponsiveValue,
} from "@hope-ui/styles";
import { clsx } from "clsx";
import { createMemo, splitProps } from "solid-js";

import { lineClamp } from "../utils";
import { TextStyleConfigProps, useTextStyleConfig } from "./text.styles";

export interface TextProps extends TextStyleConfigProps {
  /** The number of lines the text should be truncate. */
  lineClamp?: ResponsiveValue<number>;
}

export type TextTheme = ComponentTheme<TextProps, "size">;

/**
 * Text component is the used to render text and paragraphs within an interface.
 * It renders a <p> tag by default.
 */
export const Text = createHopeComponent<"p", TextProps>(props => {
  props = mergeThemeProps("Text", {}, props);

  const [local, styleConfigProps, others] = splitProps(
    props,
    ["class", "lineClamp"],
    ["styleConfig", "unstyled", "size"]
  );

  const { classes, styles } = useTextStyleConfig("Text", styleConfigProps);

  const rootStyles = createMemo(() => ({
    ...styles().root,
    ...lineClamp(local.lineClamp),
  }));

  return <hope.p class={clsx(classes().root, local.class)} __css={rootStyles()} {...others} />;
});
