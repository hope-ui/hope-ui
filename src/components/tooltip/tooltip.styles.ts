/* -------------------------------------------------------------------------------------------------
 * Tooltip - solid-transition-group classes
 * -----------------------------------------------------------------------------------------------*/

import { globalCss } from "@/styled-system/stitches.config";

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
