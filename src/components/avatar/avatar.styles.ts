import { VariantProps } from "@stitches/core";

import { css } from "@/styled-system/stitches.config";

/* -------------------------------------------------------------------------------------------------
 * Avatar
 * -----------------------------------------------------------------------------------------------*/

export const avatarStyles = css({
  position: "relative",

  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,

  borderRadius: "$full",
  borderColor: "$background",

  backgroundColor: "$neutral6",

  color: "$neutral12",
  textAlign: "center",
  textTransform: "uppercase",
  fontWeight: "medium",

  verticalAlign: "top",

  variants: {
    size: {
      "2xs": {
        boxSize: "$4",
        fontSize: "calc($sizes$4 / 2.5)",
        lineHeight: "$sizes$4",
      },
      xs: {
        boxSize: "$6",
        fontSize: "calc($sizes$6 / 2.5)",
        lineHeight: "$sizes$6",
      },
      sm: {
        boxSize: "$8",
        fontSize: "calc($sizes$8 / 2.5)",
        lineHeight: "$sizes$8",
      },
      md: {
        boxSize: "$12",
        fontSize: "calc($sizes$12 / 2.5)",
        lineHeight: "$sizes$12",
      },
      lg: {
        boxSize: "$16",
        fontSize: "calc($sizes$16 / 2.5)",
        lineHeight: "$sizes$16",
      },
      xl: {
        boxSize: "$24",
        fontSize: "calc($sizes$24 / 2.5)",
        lineHeight: "$sizes$24",
      },
      "2xl": {
        boxSize: "$32",
        fontSize: "calc($sizes$32 / 2.5)",
        lineHeight: "$sizes$32",
      },
      full: {
        boxSize: "$full",
        fontSize: "calc($sizes$full / 2.5)",
      },
    },
    withBorder: {
      true: {
        borderWidth: "2px",
      },
    },
  },
});

export type AvatarVariants = VariantProps<typeof avatarStyles>;

/* -------------------------------------------------------------------------------------------------
 * Avatar - image
 * -----------------------------------------------------------------------------------------------*/

export const avatarImageStyles = css({
  width: "100%",
  height: "100%",

  borderRadius: "$full",

  objectFit: "cover",
});

/* -------------------------------------------------------------------------------------------------
 * Avatar - badge
 * -----------------------------------------------------------------------------------------------*/

export const avatarBadgeStyles = css({
  position: "absolute",
  insetInlineEnd: "0",
  bottom: "0",

  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  borderRadius: "$full",

  borderWidth: "0.2em",
  borderStyle: "solid",
  borderColor: "$background",

  transform: "translate(25%, 25%)",
});
