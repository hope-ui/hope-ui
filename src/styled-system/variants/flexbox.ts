import { SystemStyleObject } from "@/theme";

export function createFlexboxUtilityVariants() {
  return {
    flexDirection: {
      row: { flexDirection: "row" } as SystemStyleObject,
      "row-reverse": { flexDirection: "row-reverse" } as SystemStyleObject,
      column: { flexDirection: "column" } as SystemStyleObject,
      "column-reverse": { flexDirection: "column-reverse" } as SystemStyleObject,
    },
    flexWrap: {
      nowrap: { flexWrap: "nowrap" } as SystemStyleObject,
      wrap: { flexWrap: "wrap" } as SystemStyleObject,
      "wrap-reverse": { flexWrap: "wrap-reverse" } as SystemStyleObject,
    },
  };
}

/* -------------------------------------------------------------------------------------------------
 * Common Flexbox and CSS Grid utilities
 * -----------------------------------------------------------------------------------------------*/

export function createCommonFlexboxAndGridUtilityVariants() {
  return {
    flex: {
      1: { flex: "1 1 0%" } as SystemStyleObject,
      auto: { flex: "1 1 auto" } as SystemStyleObject,
      initial: { flex: "0 1 auto" } as SystemStyleObject,
      none: { flex: "none" } as SystemStyleObject,
    },
    flexGrow: {
      1: { flexGrow: "1" } as SystemStyleObject,
      0: { flexGrow: "0" } as SystemStyleObject,
    },
    flexShrink: {
      1: { flexShrink: "1" } as SystemStyleObject,
      0: { flexShrink: "0" } as SystemStyleObject,
    },
    order: {
      first: { order: "-9999" } as SystemStyleObject,
      last: { order: "9999" } as SystemStyleObject,
    },
    alignItems: {
      start: { alignItems: "flex-start" } as SystemStyleObject,
      end: { alignItems: "flex-end" } as SystemStyleObject,
      center: { alignItems: "center" } as SystemStyleObject,
      baseline: { alignItems: "baseline" } as SystemStyleObject,
      stretch: { alignItems: "stretch" } as SystemStyleObject,
    },
    alignContent: {
      start: { alignContent: "flex-start" } as SystemStyleObject,
      end: { alignContent: "flex-end" } as SystemStyleObject,
      center: { alignContent: "center" } as SystemStyleObject,
      between: { alignContent: "space-between" } as SystemStyleObject,
      around: { alignContent: "space-around" } as SystemStyleObject,
      evenly: { alignContent: "space-evenly" } as SystemStyleObject,
    },
    alignSelf: {
      auto: { alignSelf: "auto" } as SystemStyleObject,
      start: { alignSelf: "flex-start" } as SystemStyleObject,
      end: { alignSelf: "flex-end" } as SystemStyleObject,
      center: { alignSelf: "center" } as SystemStyleObject,
      stretch: { alignSelf: "stretch" } as SystemStyleObject,
      baseline: { alignSelf: "baseline" } as SystemStyleObject,
    },
    justifyItems: {
      start: { justifyItems: "start" } as SystemStyleObject,
      end: { justifyItems: "end" } as SystemStyleObject,
      center: { justifyItems: "center" } as SystemStyleObject,
      stretch: { justifyItems: "stretch" } as SystemStyleObject,
    },
    justifyContent: {
      start: { justifyContent: "flex-start" } as SystemStyleObject,
      end: { justifyContent: "flex-end" } as SystemStyleObject,
      center: { justifyContent: "center" } as SystemStyleObject,
      between: { justifyContent: "space-between" } as SystemStyleObject,
      around: { justifyContent: "space-around" } as SystemStyleObject,
      evenly: { justifyContent: "space-evenly" } as SystemStyleObject,
    },
    justifySelf: {
      auto: { justifySelf: "auto" } as SystemStyleObject,
      start: { justifySelf: "start" } as SystemStyleObject,
      end: { justifySelf: "end" } as SystemStyleObject,
      center: { justifySelf: "center" } as SystemStyleObject,
      stretch: { justifySelf: "stretch" } as SystemStyleObject,
    },
    placeItems: {
      start: { placeItems: "start" } as SystemStyleObject,
      end: { placeItems: "end" } as SystemStyleObject,
      center: { placeItems: "center" } as SystemStyleObject,
      stretch: { placeItems: "stretch" } as SystemStyleObject,
    },
    placeContent: {
      start: { placeContent: "start" } as SystemStyleObject,
      end: { placeContent: "end" } as SystemStyleObject,
      center: { placeContent: "center" } as SystemStyleObject,
      between: { placeContent: "space-between" } as SystemStyleObject,
      around: { placeContent: "space-around" } as SystemStyleObject,
      evenly: { placeContent: "space-evenly" } as SystemStyleObject,
      stretch: { placeContent: "stretch" } as SystemStyleObject,
    },
    placeSelf: {
      auto: { placeSelf: "auto" } as SystemStyleObject,
      start: { placeSelf: "start" } as SystemStyleObject,
      end: { placeSelf: "end" } as SystemStyleObject,
      center: { placeSelf: "center" } as SystemStyleObject,
      stretch: { placeSelf: "stretch" } as SystemStyleObject,
    },
  };
}
