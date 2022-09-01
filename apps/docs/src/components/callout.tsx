import { hope } from "@hope-ui/core";

export const Callout = hope(
  "div",
  {
    base: {
      display: "flex",
      alignItems: "center",
      gap: 4,
      rounded: "md",
      my: 8,
      p: 4,
      fontSize: "base",
      lineHeight: 6,
    },
    variants: {
      type: {
        note: {
          backgroundColor: "primary.50",
          color: "primary.800",
        },
        warning: {
          backgroundColor: "warning.50",
          color: "warning.800",
        },
      },
    },
    defaultVariants: {
      type: "note",
    },
  },
  "hope-docs-Callout-root"
);
