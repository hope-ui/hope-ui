import { hope } from "@hope-ui/core";

export const Preview = hope("div", vars => ({
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    mt: 6,
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
    isFullRounded: {
      true: {
        rounded: "lg",
      },
    },
  },
}));
