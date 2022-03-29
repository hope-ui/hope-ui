import { css, keyframes } from "@/styled-system/stitches.config";

const skeletonColorFade = keyframes({
  from: {
    borderColor: "$$startColor",
    background: "$$startColor",
  },
  to: {
    borderColor: "$$endColor",
    background: "$$endColor",
  },
});

export const skeletonStyles = css({
  $$startColor: "$colors$neutral2",
  $$endColor: "$colors$neutral8",

  opacity: "0.7",

  borderRadius: "2px",
  borderColor: "$$startColor",

  boxShadow: "$none",

  background: "$$endColor",
  backgroundClip: "padding-box",

  color: "transparent",

  cursor: "default",
  pointerEvents: "none",
  userSelect: "none",

  animationTimingFunction: "linear",
  animationIterationCount: "infinite",
  animationDirection: "alternate",
  animationName: `${skeletonColorFade()}`,

  "&::before, &::after, *": {
    visibility: "hidden",
  },
});
