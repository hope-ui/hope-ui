import { globalCss } from "../stitches.config";
import { ThemeBase } from "../types";
import { COLOR_MODE_CLASSNAMES } from "../utils";

export function globalStyles(theme: ThemeBase) {
  const styles = globalCss({
    ":root": {
      "--hope-colors-background-body": "white",
      "--hope-colors-text": theme.colors.neutral["800"],
    },

    [`.${COLOR_MODE_CLASSNAMES.dark}`]: {
      "--hope-colors-background-body": theme.colors.neutral["900"],
      "--hope-colors-text": theme.colors.neutral["100"],
    },

    "*, ::before, ::after": {
      boxSizing: "border-box",
    },

    html: {
      fontFamily: theme.fonts.sans,
      lineHeight: theme.lineHeights.base,
      fontSize: "16px",
    },

    body: {
      margin: 0,
      backgroundColor: "var(--hope-colors-background-body)",
      color: "var(--hope-colors-text)",
      fontFamily: "inherit",
      lineHeight: "inherit",
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
    },
  });

  styles();
}
