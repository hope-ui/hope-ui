import { globalCss } from "../stitches.config";
import { ThemeBase } from "../types";
import { COLOR_MODE_CLASSNAMES } from "../utils";

export function globalStyles(theme: ThemeBase) {
  const styles = globalCss({
    ":root": {
      "--hope-colors-body-background": "white",
      "--hope-colors-body-text": theme.colors.neutral["800"],
    },

    [`.${COLOR_MODE_CLASSNAMES.dark}`]: {
      "--hope-colors-body-background": theme.colors.neutral["900"],
      "--hope-colors-body-text": theme.colors.neutral["100"],
    },

    "*, ::before, ::after": {
      boxSizing: "border-box",
      borderWidth: "0",
      borderStyle: "solid",
    },

    html: {
      fontFamily: theme.fonts.sans,
      lineHeight: theme.lineHeights.base,
      fontSize: "16px",
    },

    body: {
      margin: 0,
      backgroundColor: "var(--hope-colors-body-background)",
      color: "var(--hope-colors-body-text)",
      fontFamily: "inherit",
      lineHeight: "inherit",
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
    },
  });

  styles();
}
