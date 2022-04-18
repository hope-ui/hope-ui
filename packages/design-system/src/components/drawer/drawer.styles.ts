import { VariantProps } from "@stitches/core";

import { css, globalCss } from "../../styled-system/stitches.config";
import { baseDialogStyles, baseModalContainerStyles } from "../modal/modal.styles";

/* -------------------------------------------------------------------------------------------------
 * Drawer - solid-transition-group classes
 * -----------------------------------------------------------------------------------------------*/

export const drawerTransitionName = {
  fade: "hope-drawer-fade-transition",
  slideInTop: "hope-drawer-slide-in-top-transition",
  slideInRight: "hope-drawer-slide-in-right-transition",
  slideInBottom: "hope-drawer-slide-in-bottom-transition",
  slideInLeft: "hope-drawer-slide-in-left-transition",
};

export const drawerTransitionStyles = globalCss({
  /* fade */
  [`.${drawerTransitionName.fade}-enter, .${drawerTransitionName.fade}-exit-to`]: {
    opacity: 0,
  },
  [`.${drawerTransitionName.fade}-enter-to, .${drawerTransitionName.fade}-exit`]: {
    opacity: 1,
  },
  [`.${drawerTransitionName.fade}-enter-active, .${drawerTransitionName.fade}-exit-active`]: {
    transition: "opacity 500ms ease-in-out",
  },

  /* slide common */
  [`.${drawerTransitionName.slideInTop}-enter-active, .${drawerTransitionName.slideInTop}-exit-active,
    .${drawerTransitionName.slideInRight}-enter-active, .${drawerTransitionName.slideInRight}-exit-active,
    .${drawerTransitionName.slideInBottom}-enter-active, .${drawerTransitionName.slideInBottom}-exit-active,
    .${drawerTransitionName.slideInLeft}-enter-active, .${drawerTransitionName.slideInLeft}-exit-active`]:
    {
      transition: "transform 500ms ease-in-out",
    },

  /* slide-in-top */
  [`.${drawerTransitionName.slideInTop}-enter, .${drawerTransitionName.slideInTop}-exit-to`]: {
    transform: "translateY(-100%)",
  },
  [`.${drawerTransitionName.slideInTop}-enter-to, .${drawerTransitionName.slideInTop}-exit`]: {
    transform: "translateY(0)",
  },

  /* slide-in-right */
  [`.${drawerTransitionName.slideInRight}-enter, .${drawerTransitionName.slideInRight}-exit-to`]: {
    transform: "translateX(100%)",
  },
  [`.${drawerTransitionName.slideInRight}-enter-to, .${drawerTransitionName.slideInRight}-exit`]: {
    transform: "translateX(0)",
  },

  /* slide-in-bottom */
  [`.${drawerTransitionName.slideInBottom}-enter, .${drawerTransitionName.slideInBottom}-exit-to`]:
    {
      transform: "translateY(100%)",
    },
  [`.${drawerTransitionName.slideInBottom}-enter-to, .${drawerTransitionName.slideInBottom}-exit`]:
    {
      transform: "translateY(0)",
    },

  /* slide-in-left */
  [`.${drawerTransitionName.slideInLeft}-enter, .${drawerTransitionName.slideInLeft}-exit-to`]: {
    transform: "translateX(-100%)",
  },
  [`.${drawerTransitionName.slideInLeft}-enter-to, .${drawerTransitionName.slideInLeft}-exit`]: {
    transform: "translateX(0)",
  },
});

/* -------------------------------------------------------------------------------------------------
 * Drawer - container
 * -----------------------------------------------------------------------------------------------*/

export const drawerContainerStyles = css(baseModalContainerStyles, {
  overflow: "hidden",

  variants: {
    placement: {
      top: {
        alignItems: "flex-start",
        justifyContent: "stretch",
      },
      right: {
        alignItems: "stretch",
        justifyContent: "flex-end",
      },
      bottom: {
        alignItems: "flex-end",
        justifyContent: "stretch",
      },
      left: {
        alignItems: "stretch",
        justifyContent: "flex-start",
      },
    },
  },
});

/* -------------------------------------------------------------------------------------------------
 * Drawer - dialog (content)
 * -----------------------------------------------------------------------------------------------*/

export const drawerDialogStyles = css(baseDialogStyles, {
  maxHeight: "100vh",

  variants: {
    size: {
      xs: {
        maxWidth: "$xs",
      },
      sm: {
        maxWidth: "$md",
      },
      md: {
        maxWidth: "$lg",
      },
      lg: {
        maxWidth: "$2xl",
      },
      xl: {
        maxWidth: "$4xl",
      },
      full: {
        maxWidth: "100vw",
        height: "100vh",
      },
    },
    placement: {
      top: {},
      right: {},
      bottom: {},
      left: {},
    },
    fullHeight: {
      true: {
        height: "100vh",
      },
      false: {},
    },
  },
  compoundVariants: [
    /* -------------------------------------------------------------------------------------------------
     * Placement - top + size
     * -----------------------------------------------------------------------------------------------*/
    { placement: "top", size: "xs", css: { maxWidth: "100vw" } },
    { placement: "top", size: "sm", css: { maxWidth: "100vw" } },
    { placement: "top", size: "md", css: { maxWidth: "100vw" } },
    { placement: "top", size: "lg", css: { maxWidth: "100vw" } },
    { placement: "top", size: "xl", css: { maxWidth: "100vw" } },

    /* -------------------------------------------------------------------------------------------------
     * Placement - bottom + size
     * -----------------------------------------------------------------------------------------------*/
    { placement: "bottom", size: "xs", css: { maxWidth: "100vw" } },
    { placement: "bottom", size: "sm", css: { maxWidth: "100vw" } },
    { placement: "bottom", size: "md", css: { maxWidth: "100vw" } },
    { placement: "bottom", size: "lg", css: { maxWidth: "100vw" } },
    { placement: "bottom", size: "xl", css: { maxWidth: "100vw" } },
  ],
});

export type DrawerDialogVariants = VariantProps<typeof drawerDialogStyles>;
