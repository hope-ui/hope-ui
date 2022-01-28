import { VariantProps } from "@stitches/core";

import { css, theme } from "@/theme/stitches.config";
import { SystemStyleObject } from "@/theme/types";
import { SpaceVariant, utilityStyles } from "@/theme/utilityStyles";

interface GapUtilityVariants {
  gap: SpaceVariant;
  gapX: SpaceVariant;
  gapY: SpaceVariant;
}

function createGapVariants(): GapUtilityVariants {
  return Object.keys(theme.space).reduce(
    (acc, key) => ({
      gap: { ...acc.gap, [key]: { gap: `$${key}` } as SystemStyleObject },
      gapX: { ...acc.gapX, [key]: { columnGap: `$${key}` } as SystemStyleObject },
      gapY: { ...acc.gapY, [key]: { rowGap: `$${key}` } as SystemStyleObject },
    }),
    {} as GapUtilityVariants
  );
}

export const commonFlexboxAndGridStyles = css({
  boxSizing: "border-box",

  variants: {
    alignItems: {
      start: { alignItems: "flex-start" },
      end: { alignItems: "flex-end" },
      center: { alignItems: "center" },
      baseline: { alignItems: "baseline" },
      stretch: { alignItems: "stretch" },
    },
    alignContent: {
      start: { alignContent: "flex-start" },
      end: { alignContent: "flex-end" },
      center: { alignContent: "center" },
      between: { alignContent: "space-between" },
      around: { alignContent: "space-around" },
      evenly: { alignContent: "space-evenly" },
    },
    justifyItems: {
      start: { justifyItems: "start" },
      end: { justifyItems: "end" },
      center: { justifyItems: "center" },
      stretch: { justifyItems: "stretch" },
    },
    justifyContent: {
      start: { justifyContent: "flex-start" },
      end: { justifyContent: "flex-end" },
      center: { justifyContent: "center" },
      between: { justifyContent: "space-between" },
      around: { justifyContent: "space-around" },
      evenly: { justifyContent: "space-evenly" },
    },
    placeItems: {
      start: { placeItems: "start" },
      end: { placeItems: "end" },
      center: { placeItems: "center" },
      stretch: { placeItems: "stretch" },
    },
    placeContent: {
      start: { placeContent: "start" },
      end: { placeContent: "end" },
      center: { placeContent: "center" },
      between: { placeContent: "space-between" },
      around: { placeContent: "space-around" },
      evenly: { placeContent: "space-evenly" },
      stretch: { placeContent: "stretch" },
    },
    ...createGapVariants(),
  },
});

export const baseFlexStyles = css({
  variants: {
    flexDirection: {
      row: { flexDirection: "row" },
      rowReverse: { flexDirection: "row-reverse" },
      column: { flexDirection: "column" },
      columnReverse: { flexDirection: "column-reverse" },
    },
    flexWrap: {
      noWrap: { flexWrap: "nowrap" },
      wrap: { flexWrap: "wrap" },
      wrapReverse: { flexWrap: "wrap-reverse" },
    },
  },
});

export const flexStyles = css(utilityStyles, commonFlexboxAndGridStyles, baseFlexStyles, {
  display: "flex",
});

export type CommonFlexboxAndGridVariants = VariantProps<typeof commonFlexboxAndGridStyles>;

type BaseFlexVariants = VariantProps<typeof baseFlexStyles>;

export type FlexVariants = VariantProps<typeof flexStyles>;

/**
 * Used to splitProps in <Flex/>, <Grid/> and <Box/> component.
 */
export const commonFlexboxAndGridStyleProps: Array<keyof CommonFlexboxAndGridVariants> = [
  "alignItems",
  "alignContent",
  "justifyItems",
  "justifyContent",
  "placeItems",
  "placeContent",
  "gap",
  "gapX",
  "gapY",
];

/**
 * Used to splitProps in <Flex/> and <Box/> component.
 */
export const baseFlexStyleProps: Array<keyof BaseFlexVariants> = ["flexDirection", "flexWrap"];

/**
 * Used to splitProps in <Flex/> component.
 */
export const flexStyleProps = [...commonFlexboxAndGridStyleProps, ...baseFlexStyleProps];
