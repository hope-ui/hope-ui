import { VariantProps } from "@stitches/core";

import { css, globalCss } from "@/styled-system/stitches.config";

/* -------------------------------------------------------------------------------------------------
 * Popover - solid-transition-group classes
 * -----------------------------------------------------------------------------------------------*/

export const popoverTransitionName = {
  scale: "hope-popover-scale-transition",
};

export const popoverTransitionStyles = globalCss({
  /* scale */
  [`.${popoverTransitionName.scale}-enter, .${popoverTransitionName.scale}-exit-to`]: {
    opacity: 0,
    transform: "scale(0.95)",
  },
  [`.${popoverTransitionName.scale}-enter-to, .${popoverTransitionName.scale}-exit`]: {
    opacity: 1,
    transform: "scale(1)",
  },
  [`.${popoverTransitionName.scale}-enter-active`]: {
    transitionProperty: "opacity, transform",
    transitionDuration: "300ms",
    transitionTimingFunction: "ease",
  },
  [`.${popoverTransitionName.scale}-exit-active`]: {
    transitionProperty: "opacity, transform",
    transitionDuration: "200ms",
    transitionTimingFunction: "ease-in-out",
  },
});

/* -------------------------------------------------------------------------------------------------
 * Popover
 * -----------------------------------------------------------------------------------------------*/

/* -------------------------------------------------------------------------------------------------
 * Popover - content
 * -----------------------------------------------------------------------------------------------*/

export const popoverContentStyles = css({
  zIndex: "$popover",
  position: "relative",

  display: "flex",
  flexDirection: "column",
  justifyContent: "center",

  width: "100%",
  maxWidth: "$xs",

  outline: "none",
  boxShadow: "$md",
  backgroundColor: "$loContrast",
  borderRadius: "$sm",

  color: "inherit",

  "&:focus": {
    outline: "none",
    boxShadow: "$outline",
  },
});

/* -------------------------------------------------------------------------------------------------
 * Popover - header
 * -----------------------------------------------------------------------------------------------*/

export const popoverHeaderStyles = css({
  flex: 0,
  pt: "$5",
  px: "$5",
  pb: "$3",
  fontSize: "$lg",
  fontWeight: "$medium",
});

/* -------------------------------------------------------------------------------------------------
 * Popover - body
 * -----------------------------------------------------------------------------------------------*/

export const popoverBodyStyles = css({
  flex: 1,
  px: "$5",
  py: "$2",
});

/* -------------------------------------------------------------------------------------------------
 * Popover - footer
 * -----------------------------------------------------------------------------------------------*/

export const popoverFooterStyles = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  pt: "$3",
  px: "$5",
  pb: "$5",
});

/* -------------------------------------------------------------------------------------------------
 * Popover - close button
 * -----------------------------------------------------------------------------------------------*/

export const popoverCloseButtonStyles = css({
  position: "absolute",
  top: "$4",
  insetInlineEnd: "$4",
});

/* -------------------------------------------------------------------------------------------------
 * Popover - arrow
 * -----------------------------------------------------------------------------------------------*/

export const popoverArrowStyles = css({
  zIndex: "$popover",
  position: "absolute",
  boxSize: "8px",
  backgroundColor: "inherit",
  transform: "rotate(45deg)",
});
