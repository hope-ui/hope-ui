import {
  ComponentTheme,
  createHopeComponent,
  hope,
  mergeThemeProps,
  ResponsiveValue,
} from "@hope-ui/styles";
import { ElementType } from "@hope-ui/utils";
import { clsx } from "clsx";
import { createMemo, splitProps } from "solid-js";

import { lineClamp } from "../utils";
import { HeadingStyleConfigProps, useHeadingStyleConfig } from "./heading.styles";

type StringAndNumber<T extends number> = T | `${T}`;

type HeadingLevel = StringAndNumber<1 | 2 | 3 | 4 | 5 | 6>;

export interface HeadingProps extends HeadingStyleConfigProps {
  /** The level of heading to be rendered. For example `3` will render a h3. */
  level?: HeadingLevel;

  /** The number of lines the text should be truncate. */
  lineClamp?: ResponsiveValue<number>;
}

export type HeadingTheme = ComponentTheme<HeadingProps, "level" | "size">;

/**
 * Headings are used for rendering headlines.
 * It renders an <h2> tag by default.
 */
export const Heading = createHopeComponent<"h2", HeadingProps>(props => {
  props = mergeThemeProps("Heading", {}, props);

  const [local, styleConfigProps, others] = splitProps(
    props,
    ["as", "class", "level", "lineClamp"],
    ["styleConfigOverride", "unstyled", "size"]
  );

  const { baseClasses, styleOverrides } = useHeadingStyleConfig("Heading", styleConfigProps);

  // create an `<h>` tag with the level or return the `as` prop
  const asProp = () => (local.level ? `h${local.level}` : local.as);

  const rootStyles = createMemo(() => ({
    ...styleOverrides().root,
    ...lineClamp(local.lineClamp),
  }));

  return (
    <hope.h2
      as={asProp() as ElementType}
      class={clsx(baseClasses().root, local.class)}
      __css={rootStyles()}
      {...others}
    />
  );
});
