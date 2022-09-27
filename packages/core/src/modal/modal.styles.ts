import { createStyleConfig, StyleConfigProps } from "@hope-ui/styles";

import { rgba } from "../utils";

export type ModalParts = "root" | "content" | "overlay" | "heading" | "description";

interface ModalVariants {
  /** The size of the modal. */
  size: "xs" | "sm" | "md" | "lg" | "xl" | "full";

  /** Whether the modal should be centered on screen. */
  isCentered: boolean;

  /** Defines how scrolling should happen when content overflows beyond the viewport. */
  scrollBehavior: "inside" | "outside";
}

export const useModalStyleConfig = createStyleConfig<ModalParts, ModalVariants>(theme => ({
  root: {
    baseStyle: {
      zIndex: "modal",
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

      outline: "none",

      _focus: {
        outline: "none",
      },
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
      zIndex: "modal",
      position: "relative",

      display: "flex",
      flexDirection: "column",

      width: "100%",

      my: 12,
      mx: 4,

      outline: "none",

      boxShadow: "lg",
      borderRadius: "sm",
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
          m: 0,
          borderRadius: "none",
        },
      },
      scrollBehavior: {
        inside: {
          maxHeight: "calc(100% - 6rem)", // my * 2
          overflow: "auto",
        },
        outside: {
          maxHeight: "none",
          overflow: undefined,
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
