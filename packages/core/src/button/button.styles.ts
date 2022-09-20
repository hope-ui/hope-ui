import {
  createStyleConfig,
  focusStyles,
  spin,
  StyleConfigCompoundVariant,
  StyleConfigProps,
  ThemeColorScheme,
  ThemeSize,
  ThemeVars,
} from "@hope-ui/styles";

import { rgba } from "../utils";

export type ButtonParts =
  | "root"
  | "icon"
  | "leftIcon"
  | "rightIcon"
  | "loaderWrapper"
  | "loaderIcon";

interface ButtonVariants {
  /** The color of the button. */
  colorScheme: ThemeColorScheme;

  /** The visual style of the button. */
  variant: "solid" | "soft" | "outlined" | "plain" | "default";

  /** The size of the button. */
  size: "xs" | "sm" | "md" | "lg";

  /** Whether the button should take all available width. */
  isFullWidth: boolean;

  /** Whether the button is an icon only button. */
  isIconButton: boolean;
}

const colorSchemes: Array<ButtonVariants["colorScheme"]> = [
  "primary",
  "neutral",
  "success",
  "info",
  "warning",
  "danger",
];

function getRootSolidColorSchemeCompoundVariants(vars: ThemeVars) {
  const compoundVariants: Array<StyleConfigCompoundVariant<ButtonVariants>> = [];

  for (const colorScheme of colorSchemes) {
    const isNeutral = colorScheme === "neutral";
    const isWarning = colorScheme === "warning";

    compoundVariants.push({
      variants: {
        variant: "solid",
        colorScheme,
      },
      style: {
        color: isWarning ? vars.colors[colorScheme]["900"] : "common.white",
        backgroundColor: vars.colors[colorScheme][isNeutral ? "800" : isWarning ? "300" : "500"],
        borderColor: vars.colors[colorScheme][isNeutral ? "800" : isWarning ? "300" : "500"],

        _hover: {
          color: isWarning ? vars.colors[colorScheme]["900"] : "common.white",
          backgroundColor: vars.colors[colorScheme][isNeutral ? "700" : isWarning ? "400" : "600"],
          borderColor: vars.colors[colorScheme][isNeutral ? "700" : isWarning ? "400" : "600"],
        },

        _active: {
          color: isWarning ? vars.colors[colorScheme]["900"] : "common.white",
          backgroundColor: vars.colors[colorScheme][isNeutral ? "600" : isWarning ? "500" : "700"],
          borderColor: vars.colors[colorScheme][isNeutral ? "600" : isWarning ? "500" : "700"],
        },

        _disabled: {
          color: "neutral.200",
          backgroundColor: "neutral.100",
          borderColor: "neutral.100",
        },

        _dark: {
          color: isWarning ? vars.colors[colorScheme]["900"] : "whiteAlpha.900",
          backgroundColor: vars.colors[colorScheme][isWarning ? "500" : "700"],
          borderColor: vars.colors[colorScheme][isWarning ? "500" : "700"],

          _hover: {
            color: isWarning ? vars.colors[colorScheme]["900"] : "whiteAlpha.900",
            backgroundColor: vars.colors[colorScheme][isWarning ? "400" : "600"],
            borderColor: vars.colors[colorScheme][isWarning ? "400" : "600"],
          },

          _active: {
            color: isWarning ? vars.colors[colorScheme]["900"] : "whiteAlpha.900",
            backgroundColor: vars.colors[colorScheme][isWarning ? "300" : "500"],
            borderColor: vars.colors[colorScheme][isWarning ? "300" : "500"],
          },

          _disabled: {
            color: "whiteAlpha.300",
            backgroundColor: "whiteAlpha.100",
            borderColor: "transparent",
          },
        },
      },
    });
  }

  return compoundVariants;
}

function getRootSoftColorSchemeCompoundVariants(vars: ThemeVars) {
  const compoundVariants: Array<StyleConfigCompoundVariant<ButtonVariants>> = [];

  for (const colorScheme of colorSchemes) {
    const isNeutral = colorScheme === "neutral";
    const isWarning = colorScheme === "warning";

    compoundVariants.push({
      variants: {
        variant: "soft",
        colorScheme,
      },
      style: {
        color: vars.colors[colorScheme][isWarning ? "900" : "700"],
        backgroundColor: vars.colors[colorScheme][isNeutral ? "200" : isWarning ? "100" : "50"],
        borderColor: vars.colors[colorScheme][isNeutral ? "200" : isWarning ? "100" : "50"],

        _hover: {
          color: vars.colors[colorScheme][isWarning ? "900" : "800"],
          backgroundColor: vars.colors[colorScheme][isNeutral ? "300" : isWarning ? "200" : "100"],
          borderColor: vars.colors[colorScheme][isNeutral ? "300" : isWarning ? "200" : "100"],
        },

        _active: {
          color: vars.colors[colorScheme][isWarning ? "900" : "800"],
          backgroundColor: vars.colors[colorScheme][isNeutral ? "400" : isWarning ? "300" : "200"],
          borderColor: vars.colors[colorScheme][isNeutral ? "400" : isWarning ? "300" : "200"],
        },

        _disabled: {
          color: "neutral.200",
          backgroundColor: "neutral.50",
          borderColor: "neutral.50",
        },

        _dark: {
          color: vars.colors[colorScheme]["200"],
          backgroundColor: rgba(vars.colors[colorScheme].mainChannel, 0.2),
          borderColor: "transparent",

          _hover: {
            color: vars.colors[colorScheme]["200"],
            backgroundColor: rgba(vars.colors[colorScheme].mainChannel, 0.3),
            borderColor: "transparent",
          },

          _active: {
            color: vars.colors[colorScheme]["200"],
            backgroundColor: rgba(vars.colors[colorScheme].mainChannel, 0.4),
            borderColor: "transparent",
          },

          _disabled: {
            color: "whiteAlpha.200",
            backgroundColor: "whiteAlpha.50",
            borderColor: "transparent",
          },
        },
      },
    });
  }

  return compoundVariants;
}

function getRootOutlinedColorSchemeCompoundVariants(vars: ThemeVars) {
  const compoundVariants: Array<StyleConfigCompoundVariant<ButtonVariants>> = [];

  for (const colorScheme of colorSchemes) {
    const isNeutral = colorScheme === "neutral";
    const isWarning = colorScheme === "warning";

    compoundVariants.push({
      variants: {
        variant: "outlined",
        colorScheme,
      },
      style: {
        color: vars.colors[colorScheme][isWarning ? "800" : "700"],
        backgroundColor: "transparent",
        borderColor: vars.colors[colorScheme][isNeutral || isWarning ? "400" : "300"],

        _hover: {
          color: vars.colors[colorScheme][isWarning ? "800" : "700"],
          backgroundColor: vars.colors[colorScheme][isNeutral || isWarning ? "100" : "50"],
          borderColor: vars.colors[colorScheme][isNeutral || isWarning ? "500" : "400"],
        },

        _active: {
          color: vars.colors[colorScheme][isWarning ? "800" : "700"],
          backgroundColor: vars.colors[colorScheme][isNeutral || isWarning ? "200" : "100"],
          borderColor: vars.colors[colorScheme][isNeutral || isWarning ? "500" : "400"],
        },

        _disabled: {
          color: "neutral.200",
          backgroundColor: "transparent",
          borderColor: "neutral.100",
        },

        _dark: {
          color: vars.colors[colorScheme]["200"],
          backgroundColor: "transparent",
          borderColor: vars.colors[colorScheme]["800"],

          _hover: {
            color: vars.colors[colorScheme]["200"],
            backgroundColor: rgba(vars.colors[colorScheme].mainChannel, 0.1),
            borderColor: vars.colors[colorScheme]["700"],
          },

          _active: {
            color: vars.colors[colorScheme]["200"],
            backgroundColor: rgba(vars.colors[colorScheme].mainChannel, 0.2),
            borderColor: vars.colors[colorScheme]["700"],
          },

          _disabled: {
            color: "whiteAlpha.200",
            backgroundColor: "transparent",
            borderColor: "whiteAlpha.50",
          },
        },
      },
    });
  }

  return compoundVariants;
}

function getRootPlainColorSchemeCompoundVariants(vars: ThemeVars) {
  const compoundVariants: Array<StyleConfigCompoundVariant<ButtonVariants>> = [];

  for (const colorScheme of colorSchemes) {
    const isNeutral = colorScheme === "neutral";
    const isWarning = colorScheme === "warning";

    compoundVariants.push({
      variants: {
        variant: "plain",
        colorScheme,
      },
      style: {
        color: vars.colors[colorScheme][isWarning ? "800" : "700"],
        backgroundColor: "transparent",
        borderColor: "transparent",

        _hover: {
          color: vars.colors[colorScheme][isWarning ? "800" : "700"],
          backgroundColor: vars.colors[colorScheme][isNeutral || isWarning ? "100" : "50"],
          borderColor: vars.colors[colorScheme][isNeutral || isWarning ? "100" : "50"],
        },

        _active: {
          color: vars.colors[colorScheme][isWarning ? "800" : "700"],
          backgroundColor: vars.colors[colorScheme][isNeutral || isWarning ? "200" : "100"],
          borderColor: vars.colors[colorScheme][isNeutral || isWarning ? "200" : "100"],
        },

        _disabled: {
          color: "neutral.200",
          backgroundColor: "transparent",
          borderColor: "transparent",
        },

        _dark: {
          color: vars.colors[colorScheme]["200"],
          backgroundColor: "transparent",
          borderColor: "transparent",

          _hover: {
            color: vars.colors[colorScheme]["200"],
            backgroundColor: rgba(vars.colors[colorScheme].mainChannel, 0.1),
            borderColor: "transparent",
          },

          _active: {
            color: vars.colors[colorScheme]["200"],
            backgroundColor: rgba(vars.colors[colorScheme].mainChannel, 0.2),
            borderColor: "transparent",
          },

          _disabled: {
            color: "whiteAlpha.200",
            backgroundColor: "transparent",
            borderColor: "transparent",
          },
        },
      },
    });
  }

  return compoundVariants;
}

const boxSizes: Map<ButtonVariants["size"], ThemeSize> = new Map([
  ["xs", "7"],
  ["sm", "8"],
  ["md", "10"],
  ["lg", "12"],
]);

function getRootIconButtonSizeCompoundVariants() {
  const compoundVariants: Array<StyleConfigCompoundVariant<ButtonVariants>> = [];

  for (const [size, tokenValue] of boxSizes) {
    compoundVariants.push({
      variants: {
        isIconButton: true,
        size,
      },
      style: {
        width: tokenValue, // for IconButton width === height
        p: 0,
      },
    });
  }

  return compoundVariants;
}

export const useButtonStyleConfig = createStyleConfig<ButtonParts, ButtonVariants>(
  ({ vars }) => ({
    root: {
      baseStyle: {
        appearance: "none",
        position: "relative",

        display: "inline-flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 2,

        width: "auto",

        outline: "none",

        border: "1px solid transparent",
        borderRadius: "md",

        padding: 0,

        fontFamily: "inherit",
        fontSize: "100%",
        fontWeight: "medium",
        lineHeight: "none",
        textDecoration: "none",

        userSelect: "none",
        whiteSpace: "nowrap",
        verticalAlign: "middle",

        transitionProperty: "color, background-color, border-color",
        transitionDuration: "250ms",

        _disabled: {
          cursor: "not-allowed",
        },

        _loading: {
          opacity: 0.8,
        },

        ...focusStyles(vars),
      },
      variants: {
        variant: {
          default: {
            color: "neutral.800",
            backgroundColor: "common.white",
            borderColor: "neutral.300",

            _hover: {
              color: "neutral.800",
              backgroundColor: "neutral.100",
              borderColor: "neutral.300",
            },

            _active: {
              color: "neutral.800",
              backgroundColor: "neutral.200",
              borderColor: "neutral.400",
            },

            _disabled: {
              color: "neutral.200",
              backgroundColor: "transparent",
              borderColor: "neutral.100",
            },

            _dark: {
              color: "whiteAlpha.900",
              backgroundColor: "whiteAlpha.50",
              borderColor: "whiteAlpha.200",

              _hover: {
                color: "whiteAlpha.900",
                backgroundColor: "whiteAlpha.100",
                borderColor: "whiteAlpha.200",
              },

              _active: {
                color: "whiteAlpha.900",
                backgroundColor: "whiteAlpha.200",
                borderColor: "whiteAlpha.300",
              },

              _disabled: {
                color: "whiteAlpha.200",
                backgroundColor: "transparent",
                borderColor: "whiteAlpha.50",
              },
            },
          },
        },
        size: {
          xs: {
            height: boxSizes.get("xs"),
            px: 3,
            fontSize: "xs",
          },
          sm: {
            height: boxSizes.get("sm"),
            px: 4,
            fontSize: "sm",
          },
          md: {
            height: boxSizes.get("md"),
            px: 5,
            fontSize: "base",
          },
          lg: {
            height: boxSizes.get("lg"),
            px: 6,
            fontSize: "lg",
          },
        },
        isFullWidth: {
          true: {
            display: "flex",
            width: "100%",
          },
        },
      },
      compoundVariants: [
        ...getRootSolidColorSchemeCompoundVariants(vars),
        ...getRootSoftColorSchemeCompoundVariants(vars),
        ...getRootOutlinedColorSchemeCompoundVariants(vars),
        ...getRootPlainColorSchemeCompoundVariants(vars),
        ...getRootIconButtonSizeCompoundVariants(),
      ],
    },
    icon: {
      baseStyle: {
        display: "inline-flex",
        alignSelf: "center",
        flexShrink: 0,
      },
    },
    leftIcon: {},
    rightIcon: {},
    loaderWrapper: {
      baseStyle: {
        position: "absolute",
        display: "flex",
        alignItems: "center",
        flexShrink: 0,
        fontSize: "1em",
        lineHeight: "normal",
      },
    },
    loaderIcon: {
      baseStyle: {
        fontSize: "1.3em",
        animation: `1s linear infinite ${spin}`,
      },
    },
  }),
  {
    variant: "default",
    colorScheme: "primary",
    size: "md",
  }
);

export type ButtonStyleConfigProps = StyleConfigProps<typeof useButtonStyleConfig>;
