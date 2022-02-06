import { VariantProps } from "@stitches/core";

import { css } from "@/styled-system/stitches.config";

import { textStyles } from "../text/text.styles";

export const anchorStyles = css(textStyles, {
  backgroundColor: "transparent",

  textDecoration: "none",

  cursor: "pointer",
  transition: "text-decoration 250ms",

  "&:hover": {
    textDecoration: "underline",
  },
});

export type AnchorVariants = VariantProps<typeof anchorStyles>;
