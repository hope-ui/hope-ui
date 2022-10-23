import {
  createStyleConfig,
  StyleConfigProps,
  StyleConfigVariantSelection,
  SystemStyleObject,
} from "@hope-ui/styles";

import { rgba } from "../utils";

export type InputParts = "root";

export interface InputVariants {
  /** The visual style of the input. */
  variant: "filled" | "outlined" | "plain";

  /** The size of the input. */
  size: "sm" | "md" | "lg";
}

export const INPUT_DEFAULT_VARIANTS: StyleConfigVariantSelection<InputVariants> = {
  variant: "outlined",
  size: "md",
};

export const INPUT_SIZES: Record<InputVariants["size"], SystemStyleObject> = {
  sm: {
    minHeight: 8,
    fontSize: "sm",
    lineHeight: 5,
  },
  md: {
    minHeight: 10,
    fontSize: "base",
    lineHeight: 6,
  },
  lg: {
    minHeight: 12,
    fontSize: "lg",
    lineHeight: 7,
  },
};

export const useInputStyleConfig = createStyleConfig<InputParts, InputVariants>(
  ({ vars }) => ({
    root: {
      baseStyle: {
        appearance: "none",

        position: "relative",
        width: "100%",
        minWidth: 0,

        outline: "none",

        borderRadius: "sm",
        border: "1px solid transparent",

        backgroundColor: "transparent",

        padding: 0,

        color: "common.foreground",
        fontSize: "base",
        lineHeight: "base",

        transitionProperty: "color, border-color, background-color, box-shadow 250ms",
        transitionDuration: "250ms",

        "&::placeholder": {
          color: "neutral.500",
          opacity: 1,
        },

        "&[readonly]": {
          boxShadow: "none !important",
          userSelect: "all",
          cursor: "default",
        },

        "&:disabled": {
          opacity: 0.4,
          cursor: "not-allowed",
        },

        "&:focus": {
          boxShadow: {
            light: `0 0 0 3px ${rgba(vars.colors.primary.lightChannel, 0.75)}`,
            dark: `0 0 0 3px ${rgba(vars.colors.primary.darkChannel, 0.75)}`,
          },
          borderColor: {
            light: "primary.400",
            dark: "primary.600",
          },
        },

        "&[aria-invalid=true]": {
          borderColor: {
            light: "danger.400",
            dark: "danger.600",
          },
        },

        "&[aria-invalid=true]:focus": {
          boxShadow: {
            light: `0 0 0 3px ${rgba(vars.colors.danger.lightChannel, 0.75)}`,
            dark: `0 0 0 3px ${rgba(vars.colors.danger.darkChannel, 0.75)}`,
          },
        },
      },
      variants: {
        variant: {
          filled: {
            backgroundColor: {
              light: "neutral.100",
              dark: "neutral.800",
            },
          },
          outlined: {
            border: {
              light: `1px solid ${vars.colors.neutral["300"]}`,
              dark: `1px solid ${vars.colors.neutral["700"]}`,
            },
            backgroundColor: {
              light: "transparent",
              dark: "rgb(255 255 255 / 0.02)",
            },
          },
          plain: {
            backgroundColor: "transparent",
          },
        },
        size: {
          sm: {
            ...INPUT_SIZES.sm,
            px: 2.5,
          },
          md: {
            ...INPUT_SIZES.md,
            px: 3,
          },
          lg: {
            ...INPUT_SIZES.lg,
            px: 4,
          },
        },
      },
    },
  }),
  INPUT_DEFAULT_VARIANTS
);

export type InputStyleConfigProps = StyleConfigProps<typeof useInputStyleConfig>;
