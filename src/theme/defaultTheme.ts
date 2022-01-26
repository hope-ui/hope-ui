import { theme } from "@/stitches/stitches.config";

import { HopeTheme } from "./types";

export const defaultTheme: HopeTheme = {
  tokens: theme,
  components: {
    Button: {
      variant: "filled",
      color: "primary",
      size: "md",
      radius: "sm",
      loaderPosition: "left",
      compact: false,
      uppercase: false,
      fullWidth: false,
    },
    IconButton: {
      variant: "filled",
      color: "primary",
      size: "md",
      radius: "sm",
      compact: false,
    },
  },
};
