import { createStyleConfig, StyleConfigProps } from "@hope-ui/styles";

export const useStyleConfig = createStyleConfig<"root", {}>({
  root: {
    base: {
      borderRadius: "md",
      borderStyle: "solid",
      borderWidth: "1px",
      borderBottomWidth: "3px",

      px: "0.4em",

      color: "text.primary",
      fontFamily: "mono",
      fontSize: "0.8em",
      fontWeight: "bold",
      lineHeight: "normal",
      whiteSpace: "nowrap",

      borderColor: "neutral.300",
      backgroundColor: "neutral.100",

      _dark: {
        borderColor: "neutral.600",
        backgroundColor: "neutral.800",
      },
    },
  },
});

export type KbdStyleConfigProps = StyleConfigProps<typeof useStyleConfig>;
