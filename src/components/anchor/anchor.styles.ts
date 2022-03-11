import { css } from "@/styled-system/stitches.config";

export const anchorStyles = css({
  position: "relative",
  outline: "none",
  backgroundColor: "transparent",
  textDecoration: "none",
  cursor: "pointer",
  transition: "text-decoration 250ms",

  "&:hover": {
    textDecoration: "underline",
  },

  "&:focus": {
    boxShadow: "$outline",
  },
});
