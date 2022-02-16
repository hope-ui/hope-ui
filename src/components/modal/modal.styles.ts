import { VariantProps } from "@stitches/core";

import { css } from "@/styled-system/stitches.config";

/* -------------------------------------------------------------------------------------------------
 * Modal - overlay
 * -----------------------------------------------------------------------------------------------*/

export const modalOverlayStyles = css({
  zIndex: "$modal",

  position: "fixed",
  top: "0",
  left: "0",

  w: "100vw",
  h: "100vh",

  backgroundColor: "$blackAlpha11",
});

/* -------------------------------------------------------------------------------------------------
 * Modal - container
 * -----------------------------------------------------------------------------------------------*/

export const modalContainerStyles = css({
  zIndex: "$modal",
  position: "fixed",
  top: 0,
  left: 0,

  display: "flex",
  justifyContent: "center",

  width: "100vw",
  height: "100vh",
  "@supports(height: -webkit-fill-available)": {
    height: "-webkit-fill-available",
  },

  variants: {
    centered: {
      true: {
        alignItems: "center",
      },
      false: {
        alignItems: "flex-start",
      },
    },
    scrollBehavior: {
      inside: {
        overflow: "hidden",
      },
      outside: {
        overflow: "auto",
      },
    },
  },
});

export type ModalContainerVariants = VariantProps<typeof modalContainerStyles>;

/* -------------------------------------------------------------------------------------------------
 * Modal - dialog (content)
 * -----------------------------------------------------------------------------------------------*/

export const modalDialogStyles = css({
  zIndex: "$modal",
  position: "relative",

  display: "flex",
  flexDirection: "column",
  justifyContent: "center",

  width: "100%",

  outline: 0,

  my: "3.75rem",

  boxShadow: "$lg",

  borderRadius: "$sm",
  backgroundColor: "$defaultModalContentBg",

  color: "inherit",

  variants: {
    size: {
      xs: {
        maxWidth: "$xs",
      },
      sm: {
        maxWidth: "$sm",
      },
      md: {
        maxWidth: "$md",
      },
      lg: {
        maxWidth: "$lg",
      },
      xl: {
        maxWidth: "$xl",
      },
      "2xl": {
        maxWidth: "$2xl",
      },
      "3xl": {
        maxWidth: "$3xl",
      },
      "4xl": {
        maxWidth: "$4xl",
      },
      "5xl": {
        maxWidth: "$5xl",
      },
      "6xl": {
        maxWidth: "$6xl",
      },
      "7xl": {
        maxWidth: "$7xl",
      },
      "8xl": {
        maxWidth: "$8xl",
      },
      full: {
        maxWidth: "100vw",
        minHeight: "100vh",
        "@supports(min-height: -webkit-fill-available)": {
          minHeight: "-webkit-fill-available",
        },
        my: 0,
      },
    },
    scrollBehavior: {
      inside: {
        maxHeight: "calc(100% - 7.5rem)",
      },
      outside: {
        maxHeight: "none",
      },
    },
  },
});

export type ModalDialogVariants = VariantProps<typeof modalDialogStyles>;
