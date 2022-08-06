import { globalCss } from "../stitches.config";
import { Shade, ThemeBase, ThemeColor, ThemeScale } from "../types";

const THEME_SCALE_NAMES: Array<keyof ThemeScale> = [
  "colors",
  "fonts",
  "fontSizes",
  "fontWeights",
  "lineHeights",
  "letterSpacings",
  "space",
  "sizes",
  "radii",
  "shadows",
  "zIndices",
  "breakpoints",
];

export function cssVariables(theme: ThemeBase) {
  const variables: Record<string, any> = {};

  THEME_SCALE_NAMES.forEach(name => {
    const scale = theme[name];

    if (name === "colors") {
      Object.keys(theme.colors).forEach(color => {
        Object.keys(theme.colors[color]).forEach(shade => {
          variables[`--hope-colors-${color}-${shade}`] =
            theme.colors[color as ThemeColor][shade as unknown as Shade];
        });
      });
    } else {
      Object.keys(scale).forEach(token => {
        variables[`--hope-${name}-${token.replace(".", "_")}`] = scale[token];
      });
    }
  });

  const styles = globalCss({
    ":root": variables,
  });

  styles();
}
