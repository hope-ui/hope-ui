import { globalCss } from "../stitches.config";
import { Theme } from "../types";
import { COLOR_MODE_CLASSNAMES } from "../utils";

export function injectCSSVars(theme: Theme) {
  globalCss({
    ":root": theme.__cssVarsValues.root,
    [COLOR_MODE_CLASSNAMES.dark]: theme.__cssVarsValues.dark,
  })();
}
