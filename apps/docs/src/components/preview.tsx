import { hope } from "@hope-ui/core";

export const Preview = hope("div", ({ vars }) => ({
  base: {
    mt: 4,
    roundedTop: "lg",
    border: `1px solid ${vars.colors.neutral[200]}`,
    overflowY: "auto",
    p: 4,

    "& + pre.shiki": {
      mt: 0,
      mx: 0,
      mb: 4,
      p: 4,
      borderTop: "none",
      borderTopRadius: "none",
    },
  },
  variants: {
    isCentered: {
      true: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
    },
    isFullRounded: {
      true: {
        rounded: "lg",
      },
    },
  },
}));
