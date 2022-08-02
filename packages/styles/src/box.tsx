import { filterUndefined, isEmptyObject, runIfFn } from "@hope-ui/utils";
import { clsx } from "clsx";
import { createMemo, ParentProps, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { createComponentWithAs } from "./create-component-with-as";
import { extractStyleProps } from "./styled-system/extract-style-props";
import { DefaultProps } from "./styled-system/system.types";
import { toCSSObject } from "./styled-system/to-css-object";
import { useTheme } from "./theme";
import { css } from "./stitches.config";

export type BoxProps = ParentProps<DefaultProps>;

export const Box = createComponentWithAs<"div", BoxProps>(props => {
  const [local, styleProps, others] = splitProps(
    props,
    ["as", "class", "sx", "classNames", "styles", "unstyled"],
    extractStyleProps(props)
  );

  const theme = useTheme();

  const className = createMemo(() => {
    const _sx = Array.isArray(local.sx) ? local.sx : [local.sx];

    const finalStyles = Object.assign(
      {},
      filterUndefined(styleProps),
      ..._sx.map(partial => runIfFn(partial, theme()))
    );

    if (isEmptyObject(finalStyles)) {
      return local.class;
    }

    const cssComponent = css(toCSSObject(finalStyles, theme()));

    return clsx(local.class, cssComponent().className);
  });

  return <Dynamic component={local.as ?? "div"} class={className()} {...others} />;
});
