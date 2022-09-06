import { createStyleConfig, focusStyles, StyleConfigProps } from "@hope-ui/styles";

type AnchorParts = "root";

export const useAnchorStyleConfig = createStyleConfig<AnchorParts, {}>(({ vars }) => ({
  root: {
    baseStyle: {
      position: "relative",
      outline: "none",
      backgroundColor: "transparent",
      color: "inherit",
      textDecoration: "inherit",
      cursor: "pointer",
      transition: "text-decoration 250ms",

      "&:hover": {
        textDecoration: "underline",
      },

      ...focusStyles(vars),
    },
  },
}));

export type AnchorStyleConfigProps = StyleConfigProps<typeof useAnchorStyleConfig>;
