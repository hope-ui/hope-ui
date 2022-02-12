import { VariantProps } from "@stitches/core";

import { css } from "@/styled-system/stitches.config";

import { textStyles } from "../text/text.styles";

export const anchorStyles = css(textStyles, {
  position: "relative",
  outline: "none",
  backgroundColor: "transparent",
  textDecoration: "none",
  cursor: "pointer",
  transition: "text-decoration 250ms",

  "&:hover": {
    textDecoration: "underline",
  },

  "&:focus-visible": {
    outline: "2px solid #2563eb",
    outlineOffset: "4px",
  },
});

export type AnchorVariants = VariantProps<typeof anchorStyles>;
