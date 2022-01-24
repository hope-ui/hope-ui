import { theme } from "../stitches/stitches.config";
import { HopeTheme } from "./types";

export const defaultTheme: HopeTheme = {
  tokens: theme,
  components: {
    Button: {
      variant: "filled",
      color: "primary",
      size: "sm",
      radius: "sm",
      loaderPosition: "left",
      compact: false,
      uppercase: false,
      fullWidth: false,
    },
  },
};
