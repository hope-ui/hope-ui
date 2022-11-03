import { createStyleConfig, StyleConfigProps, ThemeColorScheme } from "@hope-ui/styles";

import { buttonStyles } from "./button.css";

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
  isIconOnly: boolean;
}

export const useButtonStyleConfig = createStyleConfig<ButtonParts, ButtonVariants>(
  {
    root: {
      baseStyle: { __staticClass: buttonStyles.root },
      variants: {
        variant: {
          default: { __staticClass: buttonStyles.rootVariantDefault },
        },
        size: {
          xs: { __staticClass: buttonStyles.rootSizeXs },
          sm: { __staticClass: buttonStyles.rootSizeSm },
          md: { __staticClass: buttonStyles.rootSizeMd },
          lg: { __staticClass: buttonStyles.rootSizeLg },
        },
        isFullWidth: {
          true: { __staticClass: buttonStyles.rootIsFullWidth },
        },
      },
      compoundVariants: [
        /* -------------------------------------------------------------------------------------------------
         * Variant - solid
         * -----------------------------------------------------------------------------------------------*/
        {
          variants: { variant: "solid", colorScheme: "primary" },
          style: { __staticClass: buttonStyles.rootVariantSolidPrimary },
        },
        {
          variants: { variant: "solid", colorScheme: "neutral" },
          style: { __staticClass: buttonStyles.rootVariantSolidNeutral },
        },
        {
          variants: { variant: "solid", colorScheme: "success" },
          style: { __staticClass: buttonStyles.rootVariantSolidSuccess },
        },
        {
          variants: { variant: "solid", colorScheme: "info" },
          style: { __staticClass: buttonStyles.rootVariantSolidInfo },
        },
        {
          variants: { variant: "solid", colorScheme: "warning" },
          style: { __staticClass: buttonStyles.rootVariantSolidWarning },
        },
        {
          variants: { variant: "solid", colorScheme: "danger" },
          style: { __staticClass: buttonStyles.rootVariantSolidDanger },
        },
        /* -------------------------------------------------------------------------------------------------
         * Variant - soft
         * -----------------------------------------------------------------------------------------------*/
        {
          variants: { variant: "soft", colorScheme: "primary" },
          style: { __staticClass: buttonStyles.rootVariantSoftPrimary },
        },
        {
          variants: { variant: "soft", colorScheme: "neutral" },
          style: { __staticClass: buttonStyles.rootVariantSoftNeutral },
        },
        {
          variants: { variant: "soft", colorScheme: "success" },
          style: { __staticClass: buttonStyles.rootVariantSoftSuccess },
        },
        {
          variants: { variant: "soft", colorScheme: "info" },
          style: { __staticClass: buttonStyles.rootVariantSoftInfo },
        },
        {
          variants: { variant: "soft", colorScheme: "warning" },
          style: { __staticClass: buttonStyles.rootVariantSoftWarning },
        },
        {
          variants: { variant: "soft", colorScheme: "danger" },
          style: { __staticClass: buttonStyles.rootVariantSoftDanger },
        },
        /* -------------------------------------------------------------------------------------------------
         * Variant - outlined
         * -----------------------------------------------------------------------------------------------*/
        {
          variants: { variant: "outlined", colorScheme: "primary" },
          style: { __staticClass: buttonStyles.rootVariantOutlinedPrimary },
        },
        {
          variants: { variant: "outlined", colorScheme: "neutral" },
          style: { __staticClass: buttonStyles.rootVariantOutlinedNeutral },
        },
        {
          variants: { variant: "outlined", colorScheme: "success" },
          style: { __staticClass: buttonStyles.rootVariantOutlinedSuccess },
        },
        {
          variants: { variant: "outlined", colorScheme: "info" },
          style: { __staticClass: buttonStyles.rootVariantOutlinedInfo },
        },
        {
          variants: { variant: "outlined", colorScheme: "warning" },
          style: { __staticClass: buttonStyles.rootVariantOutlinedWarning },
        },
        {
          variants: { variant: "outlined", colorScheme: "danger" },
          style: { __staticClass: buttonStyles.rootVariantOutlinedDanger },
        },
        /* -------------------------------------------------------------------------------------------------
         * Variant - plain
         * -----------------------------------------------------------------------------------------------*/
        {
          variants: { variant: "plain", colorScheme: "primary" },
          style: { __staticClass: buttonStyles.rootVariantPlainPrimary },
        },
        {
          variants: { variant: "plain", colorScheme: "neutral" },
          style: { __staticClass: buttonStyles.rootVariantPlainNeutral },
        },
        {
          variants: { variant: "plain", colorScheme: "success" },
          style: { __staticClass: buttonStyles.rootVariantPlainSuccess },
        },
        {
          variants: { variant: "plain", colorScheme: "info" },
          style: { __staticClass: buttonStyles.rootVariantPlainInfo },
        },
        {
          variants: { variant: "plain", colorScheme: "warning" },
          style: { __staticClass: buttonStyles.rootVariantPlainWarning },
        },
        {
          variants: { variant: "plain", colorScheme: "danger" },
          style: { __staticClass: buttonStyles.rootVariantPlainDanger },
        },
        /* -------------------------------------------------------------------------------------------------
         * IconButton
         * -----------------------------------------------------------------------------------------------*/
        {
          variants: { isIconOnly: true, size: "xs" },
          style: { __staticClass: buttonStyles.rootIsIconOnlySizeXs },
        },
        {
          variants: { isIconOnly: true, size: "sm" },
          style: { __staticClass: buttonStyles.rootIsIconOnlySizeSm },
        },
        {
          variants: { isIconOnly: true, size: "md" },
          style: { __staticClass: buttonStyles.rootIsIconOnlySizeMd },
        },
        {
          variants: { isIconOnly: true, size: "lg" },
          style: { __staticClass: buttonStyles.rootIsIconOnlySizeLg },
        },
      ],
    },
    icon: {
      baseStyle: { __staticClass: buttonStyles.icon },
    },
    leftIcon: {},
    rightIcon: {},
    loaderWrapper: {
      baseStyle: { __staticClass: buttonStyles.loaderWrapper },
    },
    loaderIcon: {
      baseStyle: { __staticClass: buttonStyles.loaderIcon },
    },
  },
  {
    variant: "default",
    colorScheme: "primary",
    size: "md",
  }
);

export type ButtonStyleConfigProps = StyleConfigProps<typeof useButtonStyleConfig>;
