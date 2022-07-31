import { css, cx } from "@emotion/css";
import { createMemo } from "solid-js";

import { useTheme } from "../theme";
import { Sx, SystemStyleProps, Theme } from "../types";
import { getSystemStyles } from "./get-system-styles";

function extractSx(sx: Sx, theme: Theme) {
  return typeof sx === "function" ? sx(theme) : sx;
}

export function useSx(sx: Sx | Sx[], systemProps: SystemStyleProps, className: string) {
  const theme = useTheme();

  return createMemo(() => {
    if (Array.isArray(sx)) {
      return cx(
        className,
        css(getSystemStyles(systemProps, theme())),
        sx.map(partial => css(extractSx(partial, theme())))
      );
    }

    return cx(className, css(extractSx(sx, theme())), css(getSystemStyles(systemProps, theme())));
  });
}
