import { hope, rgba } from "@hope-ui/core";

export const Callout = hope(
  "div",
  theme => ({
    baseStyle: {
      display: "flex",
      alignItems: "center",
      rounded: "md",
      mt: 6,
      p: 4,
      fontSize: "base",
      lineHeight: 6,
    },
    variants: {
      type: {
        note: {
          backgroundColor: "primary.50",
          color: "primary.800",

          _dark: {
            backgroundColor: rgba(theme.vars.colors.primary.darkChannel, 0.4),
            color: "primary.300",
          },
        },
        warning: {
          backgroundColor: "warning.50",
          color: "warning.800",

          _dark: {
            backgroundColor: rgba(theme.vars.colors.warning.darkChannel, 0.2),
            color: "warning.500",
          },
        },
      },
    },
    defaultVariants: {
      type: "note",
    },
  }),
  "hope-docs-Callout-root"
);
