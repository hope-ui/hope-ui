import { createStyleConfig, StyleConfigProps } from "@hope-ui/styles";

export const useKbdStyleConfig = createStyleConfig<"root", {}>({
  root: {
    baseStyle: {
      borderRadius: "md",
      borderStyle: "solid",
      borderWidth: "1px",
      borderBottomWidth: "3px",

      px: "0.4em",

      color: "common.foreground",
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

export type KbdStyleConfigProps = StyleConfigProps<typeof useKbdStyleConfig>;
