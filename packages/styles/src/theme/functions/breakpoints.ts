import type { ThemeBase, ThemeBreakpoint } from "../../types";

function getBreakpointValue(breakpoint: ThemeBreakpoint | number, theme: ThemeBase) {
  if (typeof breakpoint === "number") {
    return breakpoint;
  }

  return theme.breakpoints[breakpoint];
}

export function largerThan(theme: ThemeBase) {
  return (breakpoint: ThemeBreakpoint | number) => {
    return `@media (min-width: ${getBreakpointValue(breakpoint, theme) + 1}px)`;
  };
}

export function smallerThan(theme: ThemeBase) {
  return (breakpoint: ThemeBreakpoint | number) => {
    return `@media (max-width: ${getBreakpointValue(breakpoint, theme)}px)`;
  };
}
