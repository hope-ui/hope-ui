import { filterUndefined, runIfFn } from "@hope-ui/utils";
import { clsx } from "clsx";
import { createMemo, ParentProps, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { createComponentWithAs } from "./create-component-with-as";
import { css } from "./stitches.config";
import { extractStyleProps } from "./styled-system/extract-style-props";
import { toCSSObject } from "./styled-system/to-css-object";
import { useTheme } from "./theme";
import { DefaultProps } from "./types";
import { packSx } from "./utils/pack-sx";

export type BoxProps = ParentProps<DefaultProps>;

export const Box = createComponentWithAs<"div", BoxProps>(props => {
  const [local, styleProps, others] = splitProps(
    props,
    ["as", "class", "sx", "classNames", "styles", "unstyled"],
    extractStyleProps(props)
  );

  const theme = useTheme();

  const className = createMemo(() => {
    const finalStyles = Object.assign(
      {},
      filterUndefined(styleProps),
      ...packSx(local.sx).map(partial => runIfFn(partial, theme()))
    );

    const cssComponent = css(toCSSObject(finalStyles, theme()));

    return clsx(local.class, cssComponent().className);
  });

  return <Dynamic component={local.as ?? "div"} class={className()} {...others} />;
});
