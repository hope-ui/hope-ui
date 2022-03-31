import { css } from "@/styled-system/stitches.config";

/* -------------------------------------------------------------------------------------------------
 * Accordion - item
 * -----------------------------------------------------------------------------------------------*/

export const accordionItemStyles = css({
  borderTopWidth: "1px",
  borderColor: "$neutral7",

  overflowAnchor: "none",

  "&:last-of-type": {
    borderBottomWidth: "1px",
  },
});

/* -------------------------------------------------------------------------------------------------
 * Accordion - button
 * -----------------------------------------------------------------------------------------------*/

export const accordionButtonStyles = css({
  appearance: "none",

  display: "flex",
  alignItems: "center",

  width: "100%",

  outline: "none",

  backgroundColor: "transparent",

  px: "$4",
  py: "$2",

  color: "inherit",
  fontSize: "$base",
  lineHeight: "$6",

  cursor: "pointer",
  transition: "background-color 250ms",

  "&:disabled": {
    opacity: 0.4,
    cursor: "not-allowed",
  },

  "&:not(:disabled):hover": {
    backgroundColor: "$neutral4",
  },

  "&:focus": {
    outline: "none",
    boxShadow: "$outline",
  },
});

/* -------------------------------------------------------------------------------------------------
 * Accordion - icon
 * -----------------------------------------------------------------------------------------------*/

export const accordionIconStyles = css({
  fontSize: "1.25em",

  transition: "transform 250ms",
  transformOrigin: "center",

  variants: {
    expanded: {
      true: {
        transform: "rotate(-180deg)",
      },
    },
    disabled: {
      true: {
        opacity: 0.4,
      },
    },
  },
});

/* -------------------------------------------------------------------------------------------------
 * Accordion - panel
 * -----------------------------------------------------------------------------------------------*/

export const accordionPanelStyles = css({
  pt: "$2",
  px: "$4",
  pb: "$5",
});
