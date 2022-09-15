import { createStyleConfig, focusStyles, StyleConfigProps } from "@hope-ui/styles";

type CloseButtonParts = "root";

interface CloseButtonVariants {
  /** The size of the close button. */
  size: "sm" | "md" | "lg";
}

export const useCloseButtonStyleConfig = createStyleConfig<CloseButtonParts, CloseButtonVariants>(
  theme => ({
    root: {
      baseStyle: {
        appearance: "none",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,

        outline: "none",

        borderWidth: 0,
        borderRadius: "sm",
        backgroundColor: "transparent",
        padding: 0,

        color: "neutral.800",

        userSelect: "none",
        transition: "color 250ms, background-color 250ms",

        _disabled: {
          opacity: "0.5",
          cursor: "not-allowed",
        },

        _hover: {
          backgroundColor: "blackAlpha.100",
        },

        _active: {
          backgroundColor: "blackAlpha.200",
        },

        ...focusStyles(theme.vars),

        _dark: {
          color: "whiteAlpha.900",

          _hover: {
            backgroundColor: "whiteAlpha.100",
          },

          _active: {
            backgroundColor: "whiteAlpha.200",
          },
        },
      },
      variants: {
        size: {
          sm: {
            boxSize: 6,
            fontSize: "16px",
          },
          md: {
            boxSize: 8,
            fontSize: "20px",
          },
          lg: {
            boxSize: 10,
            fontSize: "24px",
          },
        },
      },
    },
  }),
  {
    size: "md",
  }
);

export type CloseButtonStyleConfigProps = StyleConfigProps<typeof useCloseButtonStyleConfig>;
