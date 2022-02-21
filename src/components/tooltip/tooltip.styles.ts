import { css, globalCss } from "@/styled-system/stitches.config";

/* -------------------------------------------------------------------------------------------------
 * Tooltip - solid-transition-group classes
 * -----------------------------------------------------------------------------------------------*/

export const tooltipTransitionName = {
  scale: "hope-tooltip-scale-transition",
};

export const tooltipTransitionStyles = globalCss({
  /* scale */
  [`.${tooltipTransitionName.scale}-enter, .${tooltipTransitionName.scale}-exit-to`]: {
    opacity: 0,
    transform: "scale(0.90)",
  },
  [`.${tooltipTransitionName.scale}-enter-to, .${tooltipTransitionName.scale}-exit`]: {
    opacity: 1,
    transform: "scale(1)",
  },
  [`.${tooltipTransitionName.scale}-enter-active`]: {
    transitionProperty: "opacity, transform",
    transitionDuration: "200ms",
    transitionTimingFunction: "ease",
  },
  [`.${tooltipTransitionName.scale}-exit-active`]: {
    transitionProperty: "opacity, transform",
    transitionDuration: "150ms",
    transitionTimingFunction: "ease-in-out",
  },
});

/* -------------------------------------------------------------------------------------------------
 * Tooltip
 * -----------------------------------------------------------------------------------------------*/

export const tooltipStyles = css({
  zIndex: "$tooltip",
  position: "absolute",

  maxWidth: "$96",
  boxShadow: "$md",
  borderRadius: "$sm",
  backgroundColor: "$neutral12",

  px: "$2",
  py: "$1",

  color: "$neutral1",
  fontSize: "$sm",
  fontWeight: "$medium",
  lineHeight: "$4",
});

/* -------------------------------------------------------------------------------------------------
 * Tooltip - arrow
 * -----------------------------------------------------------------------------------------------*/

export const tooltipArrowStyles = css({
  zIndex: "$tooltip",
  position: "absolute",
  boxSize: "8px",
  backgroundColor: "$neutral12",
  transform: "rotate(45deg)",
});
