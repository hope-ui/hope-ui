import { createStyleConfig, StyleConfigProps, SystemStyleObject } from "@hope-ui/styles";

export type FormControlParts = "root" | "label" | "description" | "errorMessage";

const baseDescriptionStyles: SystemStyleObject = {
  display: "inline-block",
  fontWeight: "normal",
  fontSize: "xs",
  lineHeight: 4,
  textAlign: "start",
  wordBreak: "break-word",
};

export const useFormControlStyleConfig = createStyleConfig<FormControlParts, {}>({
  root: {
    baseStyle: {
      display: "flex",
      flexDirection: "column",
      gap: 2,
    },
  },
  label: {
    baseStyle: {
      display: "inline-block",
      color: "common.foreground",
      WebkitTapHighlightColor: "transparent",
      fontWeight: "medium",
      fontSize: "sm",
      lineHeight: 5,
      textAlign: "start",
      wordBreak: "break-word",
    },
  },
  description: {
    baseStyle: {
      ...baseDescriptionStyles,
      color: {
        light: "neutral.600",
        dark: "neutral.500",
      },
    },
  },
  errorMessage: {
    baseStyle: {
      ...baseDescriptionStyles,
      color: {
        light: "danger.600",
        dark: "danger.500",
      },
    },
  },
});

export type FormControlStyleConfigProps = StyleConfigProps<typeof useFormControlStyleConfig>;
