import { style } from "@vanilla-extract/css";

import { focusVisibleStyles, spin, vars, withDarkThemeSelector } from "../vanilla-extract.css";

function capitalizeFirstLetter(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const colorSchemes: Array<
  keyof Pick<typeof vars.colors, "primary" | "neutral" | "success" | "info" | "warning" | "danger">
> = ["primary", "neutral", "success", "info", "warning", "danger"];

function getRootSolidColorSchemeCompoundVariants() {
  const compoundVariants: any = {};

  for (const colorScheme of colorSchemes) {
    const isNeutral = colorScheme === "neutral";
    const isWarning = colorScheme === "warning";

    compoundVariants[`rootVariantSolid${capitalizeFirstLetter(colorScheme)}`] = style({
      color: isWarning ? vars.colors[colorScheme]["900"] : vars.colors.common.white,
      backgroundColor: vars.colors[colorScheme][isNeutral ? "800" : isWarning ? "300" : "500"],
      borderColor: vars.colors[colorScheme][isNeutral ? "800" : isWarning ? "300" : "500"],

      selectors: {
        "&:hover": {
          color: isWarning ? vars.colors[colorScheme]["900"] : vars.colors.common.white,
          backgroundColor: vars.colors[colorScheme][isNeutral ? "700" : isWarning ? "400" : "600"],
          borderColor: vars.colors[colorScheme][isNeutral ? "700" : isWarning ? "400" : "600"],
        },

        "&:active": {
          color: isWarning ? vars.colors[colorScheme]["900"] : vars.colors.common.white,
          backgroundColor: vars.colors[colorScheme][isNeutral ? "600" : isWarning ? "500" : "700"],
          borderColor: vars.colors[colorScheme][isNeutral ? "600" : isWarning ? "500" : "700"],
        },

        "&:disabled": {
          color: vars.colors.neutral["200"],
          backgroundColor: vars.colors.neutral["100"],
          borderColor: vars.colors.neutral["100"],
        },

        [withDarkThemeSelector()]: {
          color: isWarning ? vars.colors[colorScheme]["900"] : vars.colors.whiteAlpha["900"],
          backgroundColor: vars.colors[colorScheme][isWarning ? "500" : "700"],
          borderColor: vars.colors[colorScheme][isWarning ? "500" : "700"],
        },

        [withDarkThemeSelector("&:hover")]: {
          color: isWarning ? vars.colors[colorScheme]["900"] : vars.colors.whiteAlpha["900"],
          backgroundColor: vars.colors[colorScheme][isWarning ? "400" : "600"],
          borderColor: vars.colors[colorScheme][isWarning ? "400" : "600"],
        },

        [withDarkThemeSelector("&:active")]: {
          color: isWarning ? vars.colors[colorScheme]["900"] : vars.colors.whiteAlpha["900"],
          backgroundColor: vars.colors[colorScheme][isWarning ? "300" : "500"],
          borderColor: vars.colors[colorScheme][isWarning ? "300" : "500"],
        },

        [withDarkThemeSelector("&:disabled")]: {
          color: vars.colors.whiteAlpha["300"],
          backgroundColor: vars.colors.whiteAlpha["100"],
          borderColor: "transparent",
        },
      },
    });
  }

  return compoundVariants as {
    rootVariantSolidPrimary: string;
    rootVariantSolidNeutral: string;
    rootVariantSolidSuccess: string;
    rootVariantSolidInfo: string;
    rootVariantSolidWarning: string;
    rootVariantSolidDanger: string;
  };
}

function getRootSoftColorSchemeCompoundVariants() {
  const compoundVariants: any = {};

  for (const colorScheme of colorSchemes) {
    const isNeutral = colorScheme === "neutral";
    const isWarning = colorScheme === "warning";

    compoundVariants[`rootVariantSoft${capitalizeFirstLetter(colorScheme)}`] = style({
      color: vars.colors[colorScheme][isWarning ? "900" : "700"],
      backgroundColor: vars.colors[colorScheme][isNeutral ? "200" : isWarning ? "100" : "50"],
      borderColor: vars.colors[colorScheme][isNeutral ? "200" : isWarning ? "100" : "50"],

      selectors: {
        "&:hover": {
          color: vars.colors[colorScheme][isWarning ? "900" : "800"],
          backgroundColor: vars.colors[colorScheme][isNeutral ? "300" : isWarning ? "200" : "100"],
          borderColor: vars.colors[colorScheme][isNeutral ? "300" : isWarning ? "200" : "100"],
        },

        "&:active": {
          color: vars.colors[colorScheme][isWarning ? "900" : "800"],
          backgroundColor: vars.colors[colorScheme][isNeutral ? "400" : isWarning ? "300" : "200"],
          borderColor: vars.colors[colorScheme][isNeutral ? "400" : isWarning ? "300" : "200"],
        },

        "&:disabled": {
          color: vars.colors.neutral["200"],
          backgroundColor: vars.colors.neutral["50"],
          borderColor: vars.colors.neutral["50"],
        },

        [withDarkThemeSelector()]: {
          color: vars.colors[colorScheme]["200"],
          backgroundColor: `rgb(${vars.colors[colorScheme].mainChannel} / 0.2)`,
          borderColor: "transparent",
        },

        [withDarkThemeSelector("&:hover")]: {
          color: vars.colors[colorScheme]["200"],
          backgroundColor: `rgb(${vars.colors[colorScheme].mainChannel} / 0.3)`,
          borderColor: "transparent",
        },

        [withDarkThemeSelector("&:active")]: {
          color: vars.colors[colorScheme]["200"],
          backgroundColor: `rgb(${vars.colors[colorScheme].mainChannel} / 0.4)`,
          borderColor: "transparent",
        },

        [withDarkThemeSelector("&:disabled")]: {
          color: vars.colors.whiteAlpha["200"],
          backgroundColor: vars.colors.whiteAlpha["50"],
          borderColor: "transparent",
        },
      },
    });
  }

  return compoundVariants as {
    rootVariantSoftPrimary: string;
    rootVariantSoftNeutral: string;
    rootVariantSoftSuccess: string;
    rootVariantSoftInfo: string;
    rootVariantSoftWarning: string;
    rootVariantSoftDanger: string;
  };
}

function getRootOutlinedColorSchemeCompoundVariants() {
  const compoundVariants: any = {};

  for (const colorScheme of colorSchemes) {
    const isNeutral = colorScheme === "neutral";
    const isWarning = colorScheme === "warning";

    compoundVariants[`rootVariantOutlined${capitalizeFirstLetter(colorScheme)}`] = style({
      color: vars.colors[colorScheme][isWarning ? "800" : "700"],
      backgroundColor: "transparent",
      borderColor: vars.colors[colorScheme][isNeutral || isWarning ? "400" : "300"],

      selectors: {
        "&:hover": {
          color: vars.colors[colorScheme][isWarning ? "800" : "700"],
          backgroundColor: vars.colors[colorScheme][isNeutral || isWarning ? "100" : "50"],
          borderColor: vars.colors[colorScheme][isNeutral || isWarning ? "500" : "400"],
        },

        "&:active": {
          color: vars.colors[colorScheme][isWarning ? "800" : "700"],
          backgroundColor: vars.colors[colorScheme][isNeutral || isWarning ? "200" : "100"],
          borderColor: vars.colors[colorScheme][isNeutral || isWarning ? "500" : "400"],
        },

        "&:disabled": {
          color: vars.colors.neutral["200"],
          backgroundColor: "transparent",
          borderColor: vars.colors.neutral["100"],
        },

        [withDarkThemeSelector()]: {
          color: vars.colors[colorScheme]["200"],
          backgroundColor: "transparent",
          borderColor: vars.colors[colorScheme]["800"],
        },

        [withDarkThemeSelector("&:hover")]: {
          color: vars.colors[colorScheme]["200"],
          backgroundColor: `rgb(${vars.colors[colorScheme].mainChannel} / 0.1)`,
          borderColor: vars.colors[colorScheme]["700"],
        },

        [withDarkThemeSelector("&:active")]: {
          color: vars.colors[colorScheme]["200"],
          backgroundColor: `rgb(${vars.colors[colorScheme].mainChannel} / 0.2)`,
          borderColor: vars.colors[colorScheme]["700"],
        },

        [withDarkThemeSelector("&:disabled")]: {
          color: vars.colors.whiteAlpha["200"],
          backgroundColor: "transparent",
          borderColor: vars.colors.whiteAlpha["50"],
        },
      },
    });
  }

  return compoundVariants as {
    rootVariantOutlinedPrimary: string;
    rootVariantOutlinedNeutral: string;
    rootVariantOutlinedSuccess: string;
    rootVariantOutlinedInfo: string;
    rootVariantOutlinedWarning: string;
    rootVariantOutlinedDanger: string;
  };
}

function getRootPlainColorSchemeCompoundVariants() {
  const compoundVariants: any = {};

  for (const colorScheme of colorSchemes) {
    const isNeutral = colorScheme === "neutral";
    const isWarning = colorScheme === "warning";

    compoundVariants[`rootVariantPlain${capitalizeFirstLetter(colorScheme)}`] = style({
      color: vars.colors[colorScheme][isWarning ? "800" : "700"],
      backgroundColor: "transparent",
      borderColor: "transparent",

      selectors: {
        "&:hover": {
          color: vars.colors[colorScheme][isWarning ? "800" : "700"],
          backgroundColor: vars.colors[colorScheme][isNeutral || isWarning ? "100" : "50"],
          borderColor: vars.colors[colorScheme][isNeutral || isWarning ? "100" : "50"],
        },

        "&:active": {
          color: vars.colors[colorScheme][isWarning ? "800" : "700"],
          backgroundColor: vars.colors[colorScheme][isNeutral || isWarning ? "200" : "100"],
          borderColor: vars.colors[colorScheme][isNeutral || isWarning ? "200" : "100"],
        },

        "&:disabled": {
          color: vars.colors.neutral["200"],
          backgroundColor: "transparent",
          borderColor: "transparent",
        },

        [withDarkThemeSelector()]: {
          color: vars.colors[colorScheme]["200"],
          backgroundColor: "transparent",
          borderColor: "transparent",
        },

        [withDarkThemeSelector("&:hover")]: {
          color: vars.colors[colorScheme]["200"],
          backgroundColor: `rgb(${vars.colors[colorScheme].mainChannel} / 0.1)`,
          borderColor: "transparent",
        },

        [withDarkThemeSelector("&:active")]: {
          color: vars.colors[colorScheme]["200"],
          backgroundColor: `rgb(${vars.colors[colorScheme].mainChannel} / 0.2)`,
          borderColor: "transparent",
        },

        [withDarkThemeSelector("&:disabled")]: {
          color: vars.colors.whiteAlpha["200"],
          backgroundColor: "transparent",
          borderColor: "transparent",
        },
      },
    });
  }

  return compoundVariants as {
    rootVariantPlainPrimary: string;
    rootVariantPlainNeutral: string;
    rootVariantPlainSuccess: string;
    rootVariantPlainInfo: string;
    rootVariantPlainWarning: string;
    rootVariantPlainDanger: string;
  };
}

export const buttonStyles = {
  root: style({
    appearance: "none",
    position: "relative",

    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    gap: vars.space["2"],

    width: "auto",

    outline: "none",

    border: "1px solid transparent",
    borderRadius: vars.radii.md,

    padding: 0,

    fontFamily: "inherit",
    fontSize: "100%",
    fontWeight: vars.fontWeights.medium,
    lineHeight: vars.lineHeights.none,
    textDecoration: "none",

    userSelect: "none",
    whiteSpace: "nowrap",
    verticalAlign: "middle",

    transitionProperty: "color, background-color, border-color",
    transitionDuration: "250ms",

    WebkitTapHighlightColor: "transparent",

    selectors: {
      "&:disabled": {
        cursor: "not-allowed",
      },

      "&[data-loading]": {
        opacity: 0.8,
      },
      ...focusVisibleStyles,
    },
  }),
  rootVariantDefault: style({
    color: vars.colors.neutral["800"],
    backgroundColor: vars.colors.common.white,
    borderColor: vars.colors.neutral["300"],

    selectors: {
      "&:hover": {
        color: vars.colors.neutral["800"],
        backgroundColor: vars.colors.neutral["100"],
        borderColor: vars.colors.neutral["300"],
      },

      "&:active": {
        color: vars.colors.neutral["800"],
        backgroundColor: vars.colors.neutral["200"],
        borderColor: vars.colors.neutral["400"],
      },

      "&:disabled": {
        color: vars.colors.neutral["200"],
        backgroundColor: "transparent",
        borderColor: vars.colors.neutral["100"],
      },

      [withDarkThemeSelector()]: {
        color: vars.colors.whiteAlpha["900"],
        backgroundColor: vars.colors.whiteAlpha["50"],
        borderColor: vars.colors.whiteAlpha["200"],
      },

      [withDarkThemeSelector("&:hover")]: {
        color: vars.colors.whiteAlpha["900"],
        backgroundColor: vars.colors.whiteAlpha["100"],
        borderColor: vars.colors.whiteAlpha["200"],
      },

      [withDarkThemeSelector("&:active")]: {
        color: vars.colors.whiteAlpha["900"],
        backgroundColor: vars.colors.whiteAlpha["200"],
        borderColor: vars.colors.whiteAlpha["300"],
      },

      [withDarkThemeSelector("&:disabled")]: {
        color: vars.colors.whiteAlpha["200"],
        backgroundColor: "transparent",
        borderColor: vars.colors.whiteAlpha["50"],
      },
    },
  }),
  rootSizeXs: style({
    height: vars.sizes["7"],
    paddingLeft: vars.space["3"],
    paddingRight: vars.space["3"],
    fontSize: vars.fontSizes.xs,
  }),
  rootSizeSm: style({
    height: vars.sizes["8"],
    paddingLeft: vars.space["4"],
    paddingRight: vars.space["4"],
    fontSize: vars.fontSizes.sm,
  }),
  rootSizeMd: style({
    height: vars.sizes["10"],
    paddingLeft: vars.space["5"],
    paddingRight: vars.space["5"],
    fontSize: vars.fontSizes.base,
  }),
  rootSizeLg: style({
    height: vars.sizes["12"],
    paddingLeft: vars.space["6"],
    paddingRight: vars.space["6"],
    fontSize: vars.fontSizes.lg,
  }),
  rootIsFullWidth: style({
    display: "flex",
    width: "100%",
  }),
  ...getRootSolidColorSchemeCompoundVariants(),
  ...getRootSoftColorSchemeCompoundVariants(),
  ...getRootOutlinedColorSchemeCompoundVariants(),
  ...getRootPlainColorSchemeCompoundVariants(),
  rootIsIconOnlySizeXs: style({
    width: vars.sizes["7"],
    padding: 0,
  }),
  rootIsIconOnlySizeSm: style({
    width: vars.sizes["8"],
    padding: 0,
  }),
  rootIsIconOnlySizeMd: style({
    width: vars.sizes["10"],
    padding: 0,
  }),
  rootIsIconOnlySizeLg: style({
    width: vars.sizes["12"],
    padding: 0,
  }),
  icon: style({
    display: "inline-flex",
    alignSelf: "center",
    flexShrink: 0,
  }),
  loaderWrapper: style({
    position: "absolute",
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
    fontSize: "1em",
    lineHeight: "normal",
  }),
  loaderIcon: style({
    fontSize: "1.3em",
    animation: `1s linear infinite ${spin}`,
  }),
};
