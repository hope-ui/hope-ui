import { createStyleConfig, StyleConfigProps, SystemStyleObject } from "@hope-ui/styles";

import { rgba } from "../utils";

export type ModalParts = "root" | "content" | "overlay" | "heading" | "description";

interface ModalVariants {
  /** The size of the modal. */
  size:
    | "xs"
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "6xl"
    | "7xl"
    | "8xl"
    | "full";

  /** Whether the modal should be centered on screen. */
  isCentered: boolean;

  /** Defines how scrolling should happen when content overflows beyond the viewport. */
  scrollBehavior: "inside" | "outside";
}

const baseModalRootStyle: SystemStyleObject = {
  zIndex: "modal",
  position: "fixed",
  top: 0,
  left: 0,

  display: "flex",

  width: "100vw",
  height: "100vh",
  "@supports(height: -webkit-fill-available)": {
    height: "-webkit-fill-available",
  },

  outline: "none",

  _focus: {
    outline: "none",
  },
};

const baseModalContentStyle: SystemStyleObject = {
  zIndex: "modal",
  position: "relative",

  display: "flex",
  flexDirection: "column",

  width: "100%",

  outline: "none",
  boxShadow: "lg",
  backgroundColor: { light: "common.white", dark: "neutral.700" },

  color: "inherit",

  _focus: {
    outline: "none",
  },
};

export const useModalStyleConfig = createStyleConfig<ModalParts, ModalVariants>(theme => ({
  root: {
    baseStyle: {
      ...baseModalRootStyle,
      justifyContent: "center",
    },
    variants: {
      isCentered: {
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
  },
  content: {
    baseStyle: {
      ...baseModalContentStyle,
      justifyContent: "center",
      my: "3.75rem",
      borderRadius: "sm",
    },
    variants: {
      size: {
        xs: { maxWidth: "xs" },
        sm: { maxWidth: "sm" },
        md: { maxWidth: "md" },
        lg: { maxWidth: "lg" },
        xl: { maxWidth: "xl" },
        "2xl": { maxWidth: "2xl" },
        "3xl": { maxWidth: "3xl" },
        "4xl": { maxWidth: "4xl" },
        "5xl": { maxWidth: "5xl" },
        "6xl": { maxWidth: "6xl" },
        "7xl": { maxWidth: "7xl" },
        "8xl": { maxWidth: "8xl" },
        full: {
          maxWidth: "100vw",
          minHeight: "100vh",
          "@supports(min-height: -webkit-fill-available)": {
            minHeight: "-webkit-fill-available",
          },
          my: 0,
          borderRadius: "none",
        },
      },
      scrollBehavior: {
        inside: {
          maxHeight: "calc(100% - 7.5rem)", // 7.5rem = my * 2
        },
        outside: {
          maxHeight: "none",
        },
      },
    },
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

export type ModalStyleConfigProps = StyleConfigProps<typeof useModalStyleConfig>;
