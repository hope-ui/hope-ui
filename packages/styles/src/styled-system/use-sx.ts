import { css, cx } from "@emotion/css";
import { runIfFn } from "@hope-ui/utils";
import { createMemo, splitProps } from "solid-js";

import { useTheme } from "../theme";
import { getUsedSystemStylePropNames, toCSSObject } from "./to-css-object";
import { SystemStyleProps } from "./system";

export function useSx(props: any) {
  const [local, systemProps] = splitProps(
    props,
    ["sx", "class"],
    getUsedSystemStylePropNames(props)
  );

  const theme = useTheme();

  return createMemo(() => {
    const _sx = Array.isArray(local.sx) ? local.sx : [local.sx];

    return cx(
      local.class,
      css(toCSSObject(systemProps, theme())),
      _sx.map(partial => css(toCSSObject(runIfFn(partial, theme()), theme())))
    );
  });
}
