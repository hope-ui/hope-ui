import { createStyleConfig, StyleConfigProps } from "@hope-ui/styles";

import { rgba } from "../utils";

export type DrawerParts = "root" | "content" | "overlay" | "heading" | "description";

export interface DrawerVariants {
  /** The size of the drawer. */
  size: "xs" | "sm" | "md" | "lg" | "xl" | "full";

  /** The placement of the drawer. */
  placement: "top" | "right" | "bottom" | "left";
}

export const useDrawerStyleConfig = createStyleConfig<DrawerParts, DrawerVariants>(theme => ({
  root: {
    baseStyle: {
      zIndex: "modal",
      position: "fixed",
      top: 0,
      left: 0,

      overflow: "hidden",

      display: "flex",
      justifyContent: "center",

      width: "100vw",
      height: "100vh",
      "@supports(height: -webkit-fill-available)": {
        height: "-webkit-fill-available",
      },

      outline: "none",

      _focus: {
        outline: "none",
      },
    },
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
  },
  content: {
    baseStyle: {
      zIndex: "drawer",
      position: "relative",

      overflow: "auto",

      display: "flex",
      flexDirection: "column",

      maxHeight: "100vh",
      "@supports(max-height: -webkit-fill-available)": {
        maxHeight: "-webkit-fill-available",
      },
      width: "100%",

      outline: "none",

      boxShadow: "lg",
      backgroundColor: { light: "common.white", dark: "neutral.700" },

      color: "inherit",

      _focus: {
        outline: "none",
      },
    },
    variants: {
      size: {
        xs: { maxWidth: "xs" },
        sm: { maxWidth: "md" },
        md: { maxWidth: "lg" },
        lg: { maxWidth: "2xl" },
        xl: { maxWidth: "4xl" },
        full: {
          maxWidth: "100vw",
          minHeight: "100vh",
          "@supports(min-height: -webkit-fill-available)": {
            minHeight: "-webkit-fill-available",
          },
        },
      },
    },
    compoundVariants: [
      /* -------------------------------------------------------------------------------------------------
       * Placement - top + size
       * -----------------------------------------------------------------------------------------------*/
      {
        variants: { placement: "top", size: "xs" },
        style: { maxWidth: "100vw" },
      },
      {
        variants: { placement: "top", size: "sm" },
        style: { maxWidth: "100vw" },
      },
      {
        variants: { placement: "top", size: "md" },
        style: { maxWidth: "100vw" },
      },
      {
        variants: { placement: "top", size: "lg" },
        style: { maxWidth: "100vw" },
      },
      {
        variants: { placement: "top", size: "xl" },
        style: { maxWidth: "100vw" },
      },

      /* -------------------------------------------------------------------------------------------------
       * Placement - bottom + size
       * -----------------------------------------------------------------------------------------------*/
      {
        variants: { placement: "bottom", size: "xs" },
        style: { maxWidth: "100vw" },
      },
      {
        variants: { placement: "bottom", size: "sm" },
        style: { maxWidth: "100vw" },
      },
      {
        variants: { placement: "bottom", size: "md" },
        style: { maxWidth: "100vw" },
      },
      {
        variants: { placement: "bottom", size: "lg" },
        style: { maxWidth: "100vw" },
      },
      {
        variants: { placement: "bottom", size: "xl" },
        style: { maxWidth: "100vw" },
      },
    ],
  },
  overlay: {
    baseStyle: {
      zIndex: "overlay",

      position: "fixed",
      top: 0,
      left: 0,

      width: "100vw",
      height: "100vh",

      backgroundColor: {
        light: rgba(theme.vars.colors.neutral.darkChannel, 0.75),
        dark: rgba(theme.vars.colors.neutral.darkChannel, 0.85),
      },
    },
  },
  heading: {},
  description: {},
}));

export type DrawerStyleConfigProps = StyleConfigProps<typeof useDrawerStyleConfig>;
