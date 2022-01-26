import { IconSpinner } from "@/icons/IconSpinner";
import { theme } from "@/stitches/stitches.config";

import { HopeTheme } from "./types";

export const defaultTheme: HopeTheme = {
  tokens: theme,
  components: {
    Button: {
      defaultProps: {
        variant: "filled",
        color: "primary",
        size: "md",
        radius: "sm",
        loader: IconSpinner,
        loaderPosition: "left",
        compact: false,
        uppercase: false,
        fullWidth: false,
      },
    },
    IconButton: {
      defaultProps: {
        variant: "filled",
        color: "primary",
        size: "md",
        radius: "sm",
        loader: IconSpinner,
        compact: false,
      },
    },
    Text: {
      defaultProps: {
        size: "base",
        weight: "normal",
        align: "left",
        color: "dark",
        secondary: false,
      },
    },
  },
};
