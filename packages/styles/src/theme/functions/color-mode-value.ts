import { ThemeBase } from "../../types";

export function colorModeValue(theme: ThemeBase) {
  return <T>(light: T, dark: T): T => {
    return theme.colorMode === "dark" ? dark : light;
  };
}
