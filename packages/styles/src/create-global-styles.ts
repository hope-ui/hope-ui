import { once, runIfFn } from "@hope-ui/utils";

import { CSSObject, globalCss } from "./stitches.config";
import { toCSSObject } from "./styled-system/to-css-object";
import { useTheme } from "./theme";
import { SystemStyleObject, Theme, ThemeVarsAndBreakpoints } from "./types";

type GlobalSystemStyleObject = Record<string, SystemStyleObject> & {
  /** The **@import** CSS at-rule imports style rules from other style sheets. */
  "@import"?: string | string[];

  /** The **@font-face** CSS at-rule specifies a custom font with which to display text. */
  "@font-face"?: FontFace | FontFace[];
};

type GlobalSystemStyleObjectInterpolation =
  | GlobalSystemStyleObject
  | ((theme: ThemeVarsAndBreakpoints) => GlobalSystemStyleObject);

/** Create a `useGlobalStyles` primitive. */
export function createGlobalStyles(interpolation: GlobalSystemStyleObjectInterpolation) {
  const runOnce = once((theme: Theme) => {
    const {
      "@import": atImport,
      "@font-face": atFontFace,
      ...rest
    } = runIfFn(interpolation, theme);

    const styles = Object.entries(rest).reduce((acc, [selector, systemStyleObject]) => {
      acc[selector] = toCSSObject(systemStyleObject, theme);

      return acc;
    }, {} as Record<string, CSSObject>);

    globalCss({
      "@import": atImport ?? [],
      "@font-face": atFontFace ?? {},
      ...styles,
    })();
  });

  return function useGlobalStyles() {
    const theme = useTheme();

    // generate global styles once.
    runOnce(theme);
  };
}
