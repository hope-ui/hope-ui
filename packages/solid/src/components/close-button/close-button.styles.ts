import { VariantProps } from "@stitches/core";

import { css } from "../../styled-system/stitches.config";

export const closeButtonStyles = css({
  appearance: "none",

  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,

  outline: "none",

  borderWidth: 0,
  borderRadius: "$sm",
  backgroundColor: "transparent",

  color: "currentColor",

  cursor: "pointer",
  userSelect: "none",
  transition: "color 250ms, background-color 250ms",

  "&:disbaled": {
    opacity: "0.5",
    cursor: "not-allowed",
    boxShadow: "none",
  },

  "&:hover": {
    backgroundColor: "$closeButtonHoverBackground",
  },

  "&:active": {
    backgroundColor: "$closeButtonActiveBackground",
  },

  "&:focus": {
    outline: "none",
    boxShadow: "$outline",
  },

  variants: {
    size: {
      sm: {
        boxSize: "24px",
        fontSize: "10px",
      },
      md: {
        boxSize: "32px",
        fontSize: "12px",
      },
      lg: {
        boxSize: "40px",
        fontSize: "16px",
      },
    },
  },
});

export type CloseButtonVariants = VariantProps<typeof closeButtonStyles>;
