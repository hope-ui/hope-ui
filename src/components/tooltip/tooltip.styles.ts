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
  position: "absolute",
  background: "#222",
  color: "white",
  fontWeight: "bold",
  padding: "5px",
  borderRadius: "4px",
  fontSize: "90%",
  pointerEvents: "none",
});

/* -------------------------------------------------------------------------------------------------
 * Tooltip - arrow
 * -----------------------------------------------------------------------------------------------*/

export const tooltipArrowStyles = css({
  position: "absolute",
  background: "#222",
  width: "8px",
  height: "8px",
  transform: "rotate(45deg)",
});
