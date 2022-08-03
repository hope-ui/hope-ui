import { ThemeBase } from "../types";

/** Return the correct value based on the theme color mode. */
export function mode(theme: ThemeBase) {
  return <T>(lightValue: T, darkValue: T) => (theme.colorMode === "dark" ? darkValue : lightValue);
}
