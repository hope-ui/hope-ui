import { createStyleConfig, StyleConfigProps, SystemStyleObject } from "@hope-ui/styles";

export type FormControlParts = "root" | "label" | "description" | "error";

interface FormControlVariants {
  /** Whether a required indicator (asterisk) should be shown when the form control is required. */
  withRequiredIndicator: boolean;
}

const baseDescriptionStyles: SystemStyleObject = {
  display: "inline-block",
  fontSize: "xs",
  fontWeight: "normal",
  lineHeight: 4,
  textAlign: "start",
  wordBreak: "break-word",

  "&[data-disabled]": {
    opacity: 0.4,
    cursor: "not-allowed",
  },
};

export const useFormControlStyleConfig = createStyleConfig<FormControlParts, FormControlVariants>(
  {
    root: {
      baseStyle: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      },
    },
    label: {
      baseStyle: {
        display: "inline-block",
        color: "common.foreground",
        WebkitTapHighlightColor: "transparent",
        fontSize: "sm",
        fontWeight: "medium",
        lineHeight: 5,
        textAlign: "start",
        wordBreak: "break-word",

        "&[data-disabled]": {
          opacity: 0.4,
          cursor: "not-allowed",
        },
      },
      variants: {
        withRequiredIndicator: {
          true: {
            _after: {
              content: '"*"',
              marginLeft: "0.5",
              color: "danger.600",
              fontSize: "base",
              fontWeight: "medium",
              lineHeight: 5,
            },
            _dark: {
              _after: {
                color: "danger.400",
              },
            },
          },
        },
      },
    },
    description: {
      baseStyle: {
        ...baseDescriptionStyles,
        color: {
          light: "neutral.600",
          dark: "neutral.400",
        },
      },
    },
    error: {
      baseStyle: {
        ...baseDescriptionStyles,
        color: {
          light: "danger.600",
          dark: "danger.400",
        },
      },
    },
  },
  {
    withRequiredIndicator: true,
  }
);

export type FormControlStyleConfigProps = StyleConfigProps<typeof useFormControlStyleConfig>;
