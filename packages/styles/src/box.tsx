import { css, cx } from "@emotion/css";
import { runIfFn } from "@hope-ui/utils";
import { createMemo, ParentProps, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { createComponentWithAs } from "./create-component-with-as";
import { extractStyleProps } from "./styled-system/extract-style-props";
import { DefaultProps } from "./styled-system/system.types";
import { toCSSObject } from "./styled-system/to-css-object";
import { useTheme } from "./theme";

export type BoxProps = ParentProps<DefaultProps>;

export const Box = createComponentWithAs<"div", BoxProps>(props => {
  const [local, styleProps, others] = splitProps(
    props,
    ["as", "class", "sx"],
    extractStyleProps(props)
  );

  const theme = useTheme();

  const className = createMemo(() => {
    const _sx = Array.isArray(local.sx) ? local.sx : [local.sx];

    return cx(
      local.class,
      css(toCSSObject(styleProps as any, theme())),
      _sx.map(partial => css(toCSSObject(runIfFn(partial, theme()) as any, theme())))
    );
  });

  return <Dynamic component={local.as ?? "div"} class={className()} {...others} />;
});
