import { HopeThemeBase } from "../../types";

export function colorModeValue(theme: HopeThemeBase) {
  return <T>(light: T, dark: T): T => {
    return theme.colorMode === "dark" ? dark : light;
  };
}
