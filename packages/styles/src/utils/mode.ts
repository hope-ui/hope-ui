import { ThemeWithoutMetaData } from "../types";

/** Return the correct value based on the theme color mode. */
export function mode(theme: ThemeWithoutMetaData) {
  return <T>(lightValue: T, darkValue: T) => (theme.colorMode === "dark" ? darkValue : lightValue);
}
