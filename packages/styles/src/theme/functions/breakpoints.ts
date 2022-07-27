import type { HopeBreakpoint, HopeThemeBase } from "../../types";

function getBreakpointValue(breakpoint: HopeBreakpoint | number, theme: HopeThemeBase) {
  if (typeof breakpoint === "number") {
    return breakpoint;
  }

  return theme.breakpoints[breakpoint];
}

export function largerThan(theme: HopeThemeBase) {
  return (breakpoint: HopeBreakpoint | number) => {
    return `@media (min-width: ${getBreakpointValue(breakpoint, theme) + 1}px)`;
  };
}

export function smallerThan(theme: HopeThemeBase) {
  return (breakpoint: HopeBreakpoint | number) => {
    return `@media (max-width: ${getBreakpointValue(breakpoint, theme)}px)`;
  };
}
