import { VariantProps } from "@stitches/core";

import { SystemStyleObject } from "@/styled-system";
import { css, globalCss } from "@/styled-system/stitches.config";

/* -------------------------------------------------------------------------------------------------
 * Menu - solid-transition-group classes
 * -----------------------------------------------------------------------------------------------*/

export const menuTransitionName = {
  scaleTopLeft: "hope-menu-scale-top-left-transition",
  scaleTopRight: "hope-menu-scale-top-right-transition",
  scaleBottomLeft: "hope-menu-scale-bottom-left-transition",
  scaleBottomRight: "hope-menu-scale-bottom-right-transition",
};

function createMenuScaleTransition(name: string, transformOrigin: string) {
  return {
    [`.${name}-enter, .${name}-exit-to`]: {
      opacity: 0,
      transform: "scale(0.8)",
    },
    [`.${name}-enter-to, .${name}-exit`]: {
      opacity: 1,
      transform: "scale(1)",
    },
    [`.${name}-enter-active`]: {
      transformOrigin,
      transitionProperty: "opacity, transform",
      transitionDuration: "200ms",
      transitionTimingFunction: "ease-out",
    },
    [`.${name}-exit-active`]: {
      transformOrigin,
      transitionProperty: "opacity, transform",
      transitionDuration: "100ms",
      transitionTimingFunction: "ease-in",
    },
  };
}

export const menuTransitionStyles = globalCss({
  ...createMenuScaleTransition(menuTransitionName.scaleTopLeft, "top left"),
  ...createMenuScaleTransition(menuTransitionName.scaleTopRight, "top right"),
  ...createMenuScaleTransition(menuTransitionName.scaleBottomLeft, "bottom left"),
  ...createMenuScaleTransition(menuTransitionName.scaleBottomRight, "bottom right"),
});

/* -------------------------------------------------------------------------------------------------
 * Menu - trigger
 * -----------------------------------------------------------------------------------------------*/

export const menuTriggerStyles = css({
  appearance: "none",
  display: "inline-flex",
  alignItems: "center",
  outline: "none",
});

/* -------------------------------------------------------------------------------------------------
 * Menu - content (the floating panel)
 * -----------------------------------------------------------------------------------------------*/

export const menuContentStyles = css({
  zIndex: "$dropdown",
  position: "absolute",
  left: 0,
  top: "100%",

  display: "flex",
  flexDirection: "column",
  minWidth: "$56",
  overflowY: "auto",

  outline: "none",

  margin: 0,

  boxShadow: "$md",
  border: "1px solid $colors$neutral7",
  borderRadius: "$sm",
  backgroundColor: "$loContrast",

  px: 0,
  py: "$1",

  "&:focus": {
    outline: "none",
  },
});

/* -------------------------------------------------------------------------------------------------
 * Menu - group
 * -----------------------------------------------------------------------------------------------*/

export const menuGroupStyles = css({});

/* -------------------------------------------------------------------------------------------------
 * Menu - label
 * -----------------------------------------------------------------------------------------------*/

export const menuLabelStyles = css({
  display: "flex",
  alignItems: "center",

  mx: "$1",

  py: "$2",
  px: "$3",

  color: "$neutral11",
  fontSize: "$xs",
  fontWeight: "$medium",
  lineHeight: "$4",
});

/* -------------------------------------------------------------------------------------------------
 * Menu - item
 * -----------------------------------------------------------------------------------------------*/

function createColorVariant(config: { color: string; bgColorActive: string }): SystemStyleObject {
  return {
    color: config.color,

    [`&[data-active]`]: {
      backgroundColor: config.bgColorActive,
    },
  };
}

export const menuItemStyles = css({
  position: "relative",

  display: "flex",
  alignItems: "center",

  mx: "$1",

  borderRadius: "$sm",

  py: "$2",
  px: "$3",

  fontSize: "$base",
  fontWeight: "$normal",
  lineHeight: "$6",

  cursor: "pointer",
  userSelect: "none",

  transition: "color 250ms, background-color 250ms",

  "&[data-disabled]": {
    color: "$neutral8",
    cursor: "not-allowed",
  },

  variants: {
    colorScheme: {
      primary: createColorVariant({ color: "$primary11", bgColorActive: "$primary3" }),
      accent: createColorVariant({ color: "$accent11", bgColorActive: "$accent3" }),
      neutral: createColorVariant({ color: "$neutral12", bgColorActive: "$neutral4" }),
      success: createColorVariant({ color: "$success11", bgColorActive: "$success3" }),
      info: createColorVariant({ color: "$info11", bgColorActive: "$info3" }),
      warning: createColorVariant({ color: "$warning11", bgColorActive: "$warning3" }),
      danger: createColorVariant({ color: "$danger11", bgColorActive: "$danger3" }),
    },
  },

  defaultVariants: {
    colorScheme: "neutral",
  },
});

export type MenuItemVariants = VariantProps<typeof menuItemStyles>;

/* -------------------------------------------------------------------------------------------------
 * Menu - item icon wrapper
 * -----------------------------------------------------------------------------------------------*/

export const menuItemIconWrapperStyles = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
});

/* -------------------------------------------------------------------------------------------------
 * Menu - item text
 * -----------------------------------------------------------------------------------------------*/

export const menuItemTextStyles = css({
  flexGrow: 1,
});

/* -------------------------------------------------------------------------------------------------
 * Menu - item command
 * -----------------------------------------------------------------------------------------------*/

export const menuItemCommandStyles = css({
  flexShrink: 0,

  color: "$neutral11",
  fontSize: "$sm",
  lineHeight: "$none",
});
