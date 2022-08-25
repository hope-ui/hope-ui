import { runIfFn } from "@hope-ui/utils";

import { CSSObject, globalCss } from "./stitches.config";
import { toCSSObject } from "./styled-system/to-css-object";
import { useTheme } from "./theme";
import { SystemStyleObject, ThemeVars } from "./types";

type GlobalSystemStyleObject = Record<string, SystemStyleObject> & {
  /** The **@import** CSS at-rule imports style rules from other style sheets. */
  "@import"?: string | string[];

  /** The **@font-face** CSS at-rule specifies a custom font with which to display text. */
  "@font-face"?: FontFace | FontFace[];
};

type GlobalSystemStyleObjectInterpolation =
  | GlobalSystemStyleObject
  | ((vars: ThemeVars) => GlobalSystemStyleObject);

/** Create a `useGlobalStyles` primitive. */
export function createGlobalStyles(interpolation: GlobalSystemStyleObjectInterpolation) {
  let isFirstLoad = true;

  return function useGlobalStyles() {
    const theme = useTheme();

    // Hack to make sure style is computed only once for every component instance,
    // but has access to the current theme since `useGlobalStyles` run in a component context.
    if (isFirstLoad) {
      const {
        "@import": atImport,
        "@font-face": atFontFace,
        ...rest
      } = runIfFn(interpolation, theme.vars);

      const styles = Object.entries(rest).reduce((acc, [selector, systemStyleObject]) => {
        acc[selector] = toCSSObject(systemStyleObject, theme);

        return acc;
      }, {} as Record<string, CSSObject>);

      globalCss({
        "@import": atImport ?? [],
        "@font-face": atFontFace ?? {},
        ...styles,
      })();

      isFirstLoad = false;
    }
  };
}
