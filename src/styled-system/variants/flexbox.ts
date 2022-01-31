import { ThemeStyleObject } from "@/theme/types";

export function createFlexboxUtilityVariants() {
  return {
    flexDirection: {
      row: { flexDirection: "row" } as ThemeStyleObject,
      "row-reverse": { flexDirection: "row-reverse" } as ThemeStyleObject,
      column: { flexDirection: "column" } as ThemeStyleObject,
      "column-reverse": { flexDirection: "column-reverse" } as ThemeStyleObject,
    },
    flexWrap: {
      nowrap: { flexWrap: "nowrap" } as ThemeStyleObject,
      wrap: { flexWrap: "wrap" } as ThemeStyleObject,
      "wrap-reverse": { flexWrap: "wrap-reverse" } as ThemeStyleObject,
    },
  };
}

/* -------------------------------------------------------------------------------------------------
 * Common Flexbox and CSS Grid utilities
 * -----------------------------------------------------------------------------------------------*/

export function createCommonFlexboxAndGridUtilityVariants() {
  return {
    flex: {
      1: { flex: "1 1 0%" } as ThemeStyleObject,
      auto: { flex: "1 1 auto" } as ThemeStyleObject,
      initial: { flex: "0 1 auto" } as ThemeStyleObject,
      none: { flex: "none" } as ThemeStyleObject,
    },
    flexGrow: {
      1: { flexGrow: "1" } as ThemeStyleObject,
      0: { flexGrow: "0" } as ThemeStyleObject,
    },
    flexShrink: {
      1: { flexShrink: "1" } as ThemeStyleObject,
      0: { flexShrink: "0" } as ThemeStyleObject,
    },
    order: {
      first: { order: "-9999" } as ThemeStyleObject,
      last: { order: "9999" } as ThemeStyleObject,
    },
    alignItems: {
      start: { alignItems: "flex-start" } as ThemeStyleObject,
      end: { alignItems: "flex-end" } as ThemeStyleObject,
      center: { alignItems: "center" } as ThemeStyleObject,
      baseline: { alignItems: "baseline" } as ThemeStyleObject,
      stretch: { alignItems: "stretch" } as ThemeStyleObject,
    },
    alignContent: {
      start: { alignContent: "flex-start" } as ThemeStyleObject,
      end: { alignContent: "flex-end" } as ThemeStyleObject,
      center: { alignContent: "center" } as ThemeStyleObject,
      between: { alignContent: "space-between" } as ThemeStyleObject,
      around: { alignContent: "space-around" } as ThemeStyleObject,
      evenly: { alignContent: "space-evenly" } as ThemeStyleObject,
    },
    alignSelf: {
      auto: { alignSelf: "auto" } as ThemeStyleObject,
      start: { alignSelf: "flex-start" } as ThemeStyleObject,
      end: { alignSelf: "flex-end" } as ThemeStyleObject,
      center: { alignSelf: "center" } as ThemeStyleObject,
      stretch: { alignSelf: "stretch" } as ThemeStyleObject,
      baseline: { alignSelf: "baseline" } as ThemeStyleObject,
    },
    justifyItems: {
      start: { justifyItems: "start" } as ThemeStyleObject,
      end: { justifyItems: "end" } as ThemeStyleObject,
      center: { justifyItems: "center" } as ThemeStyleObject,
      stretch: { justifyItems: "stretch" } as ThemeStyleObject,
    },
    justifyContent: {
      start: { justifyContent: "flex-start" } as ThemeStyleObject,
      end: { justifyContent: "flex-end" } as ThemeStyleObject,
      center: { justifyContent: "center" } as ThemeStyleObject,
      between: { justifyContent: "space-between" } as ThemeStyleObject,
      around: { justifyContent: "space-around" } as ThemeStyleObject,
      evenly: { justifyContent: "space-evenly" } as ThemeStyleObject,
    },
    justifySelf: {
      auto: { justifySelf: "auto" } as ThemeStyleObject,
      start: { justifySelf: "start" } as ThemeStyleObject,
      end: { justifySelf: "end" } as ThemeStyleObject,
      center: { justifySelf: "center" } as ThemeStyleObject,
      stretch: { justifySelf: "stretch" } as ThemeStyleObject,
    },
    placeItems: {
      start: { placeItems: "start" } as ThemeStyleObject,
      end: { placeItems: "end" } as ThemeStyleObject,
      center: { placeItems: "center" } as ThemeStyleObject,
      stretch: { placeItems: "stretch" } as ThemeStyleObject,
    },
    placeContent: {
      start: { placeContent: "start" } as ThemeStyleObject,
      end: { placeContent: "end" } as ThemeStyleObject,
      center: { placeContent: "center" } as ThemeStyleObject,
      between: { placeContent: "space-between" } as ThemeStyleObject,
      around: { placeContent: "space-around" } as ThemeStyleObject,
      evenly: { placeContent: "space-evenly" } as ThemeStyleObject,
      stretch: { placeContent: "stretch" } as ThemeStyleObject,
    },
    placeSelf: {
      auto: { placeSelf: "auto" } as ThemeStyleObject,
      start: { placeSelf: "start" } as ThemeStyleObject,
      end: { placeSelf: "end" } as ThemeStyleObject,
      center: { placeSelf: "center" } as ThemeStyleObject,
      stretch: { placeSelf: "stretch" } as ThemeStyleObject,
    },
  };
}
