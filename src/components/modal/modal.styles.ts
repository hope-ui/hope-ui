import { VariantProps } from "@stitches/core";

import { css, globalCss } from "@/styled-system/stitches.config";

/* -------------------------------------------------------------------------------------------------
 * Modal - solid-transition-group classes
 * -----------------------------------------------------------------------------------------------*/

export const modalTransitionName = {
  fade: "hope-modal-fade-transition",
  fadeInBottom: "hope-modal-fade-in-bottom-transition",
  scale: "hope-modal-scale-transition",
};

export const modalTransitionStyles = globalCss({
  /* fade */
  [`.${modalTransitionName.fade}-enter, .${modalTransitionName.fade}-exit-to`]: {
    opacity: 0,
  },
  [`.${modalTransitionName.fade}-enter-to, .${modalTransitionName.fade}-exit`]: {
    opacity: 1,
  },
  [`.${modalTransitionName.fade}-enter-active`]: {
    transition: "opacity 300ms ease-out",
  },
  [`.${modalTransitionName.fade}-exit-active`]: {
    transition: "opacity 200ms ease-in",
  },

  /* fade-in-bottom */
  [`.${modalTransitionName.fadeInBottom}-enter, .${modalTransitionName.fadeInBottom}-exit-to`]: {
    opacity: 0,
    transform: "translateY(16px)",
  },
  [`.${modalTransitionName.fadeInBottom}-enter-to, .${modalTransitionName.fadeInBottom}-exit`]: {
    opacity: 1,
    transform: "translateY(0)",
  },
  [`.${modalTransitionName.fadeInBottom}-enter-active`]: {
    transitionProperty: "opacity, transform",
    transitionDuration: "300ms",
    transitionTimingFunction: "ease-out",
  },
  [`.${modalTransitionName.fadeInBottom}-exit-active`]: {
    transitionProperty: "opacity, transform",
    transitionDuration: "200ms",
    transitionTimingFunction: "ease-in",
  },

  /* scale */
  [`.${modalTransitionName.scale}-enter, .${modalTransitionName.scale}-exit-to`]: {
    opacity: 0,
    transform: "scale(0.95)",
  },
  [`.${modalTransitionName.scale}-enter-to, .${modalTransitionName.scale}-exit`]: {
    opacity: 1,
    transform: "scale(1)",
  },
  [`.${modalTransitionName.scale}-enter-active`]: {
    transitionProperty: "opacity, transform",
    transitionDuration: "300ms",
    transitionTimingFunction: "ease-out",
  },
  [`.${modalTransitionName.scale}-exit-active`]: {
    transitionProperty: "opacity, transform",
    transitionDuration: "200ms",
    transitionTimingFunction: "ease-in",
  },
});

/* -------------------------------------------------------------------------------------------------
 * Modal - overlay
 * -----------------------------------------------------------------------------------------------*/

export const modalOverlayStyles = css({
  zIndex: "$overlay",

  position: "fixed",
  top: 0,
  left: 0,

  width: "100vw",
  height: "100vh",

  backgroundColor: "$blackAlpha11",
});

/* -------------------------------------------------------------------------------------------------
 * Modal - container
 * -----------------------------------------------------------------------------------------------*/

export const baseModalContainerStyles = css({
  zIndex: "$modal",
  position: "fixed",
  top: 0,
  left: 0,

  display: "flex",

  width: "100vw",
  height: "100vh",
  "@supports(height: -webkit-fill-available)": {
    height: "-webkit-fill-available",
  },
});

export const modalContainerStyles = css(baseModalContainerStyles, {
  justifyContent: "center",

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

export const baseDialogStyles = css({
  zIndex: "$modal",
  position: "relative",

  display: "flex",
  flexDirection: "column",

  width: "100%",

  outline: 0,

  boxShadow: "$lg",

  backgroundColor: "$panelBg",

  color: "inherit",
});

export const modalDialogStyles = css(baseDialogStyles, {
  justifyContent: "center",
  my: "3.75rem",
  borderRadius: "$lg",

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
        borderRadius: "$none",
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

/* -------------------------------------------------------------------------------------------------
 * Modal - header
 * -----------------------------------------------------------------------------------------------*/

export const modalHeaderStyles = css({
  flex: 0,
  px: "$5",
  pt: "$5",
  fontSize: "$lg",
  fontWeight: "$medium",
});

/* -------------------------------------------------------------------------------------------------
 * Modal - body
 * -----------------------------------------------------------------------------------------------*/

export const modalBodyStyles = css({
  flex: 1,
  padding: "$5",

  variants: {
    scrollBehavior: {
      inside: {
        overflow: "auto",
      },
      outside: {
        overflow: undefined,
      },
    },
  },
});

/* -------------------------------------------------------------------------------------------------
 * Modal - footer
 * -----------------------------------------------------------------------------------------------*/

export const modalFooterStyles = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  px: "$5",
  pb: "$5",
});

/* -------------------------------------------------------------------------------------------------
 * Modal - close button
 * -----------------------------------------------------------------------------------------------*/

export const modalCloseButtonStyles = css({
  position: "absolute",
  top: "$4",
  insetInlineEnd: "$4",
});
