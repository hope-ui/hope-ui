import {
  createHopeComponent,
  hope,
  mapResponsive,
  mergeThemeProps,
  ResponsiveValue,
  SystemStyleObject,
} from "@hope-ui/styles";
import { clsx } from "clsx";
import { createMemo, splitProps } from "solid-js";
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
    ...getLineClamp(local.lineClamp),
  }));

  return (
    <hope.p class={clsx(classes().root, local.class)} __css={rootStyleOverrides()} {...others} />
  );
});

function getLineClamp(lineClamp: ResponsiveValue<number> | undefined): SystemStyleObject {
  if (lineClamp == null) {
    return {};
  }

  return {
    overflow: mapResponsive(lineClamp, value => (value != null ? "hidden" : undefined)),
    textOverflow: mapResponsive(lineClamp, value => (value != null ? "ellipsis" : undefined)),
    display: mapResponsive(lineClamp, value => (value != null ? "-webkit-box" : undefined)),
    WebkitLineClamp: mapResponsive(lineClamp, value => (value != null ? value : undefined)),
    WebkitBoxOrient: mapResponsive(lineClamp, value => (value != null ? "vertical" : undefined)),
  };
}
