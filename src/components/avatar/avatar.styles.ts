import { VariantProps } from "@stitches/core";

import { css } from "@/styled-system/stitches.config";
import { SystemStyleObject } from "@/styled-system/types";

/* -------------------------------------------------------------------------------------------------
 * Avatar
 * -----------------------------------------------------------------------------------------------*/

function createSizeVariant(size: string): SystemStyleObject {
  return {
    boxSize: size,
    fontSize: `calc(${size} / 2.5)`,
    lineHeight: size,
  };
}

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
  fontWeight: "$medium",
  textAlign: "center",
  textTransform: "uppercase",

  verticalAlign: "top",

  variants: {
    size: {
      "2xs": createSizeVariant("$sizes$4"),
      xs: createSizeVariant("$sizes$6"),
      sm: createSizeVariant("$sizes$8"),
      md: createSizeVariant("$sizes$12"),
      lg: createSizeVariant("$sizes$16"),
      xl: createSizeVariant("$sizes$24"),
      "2xl": createSizeVariant("$sizes$32"),
      full: {
        boxSize: "$full",
        fontSize: "calc($sizes$full / 2.5)",
      },
    },
    withBorder: {
      true: { borderWidth: "0.1em" },
    },
  },
});

export type AvatarVariants = VariantProps<typeof avatarStyles>;

/* -------------------------------------------------------------------------------------------------
 * Avatar - excess label
 * -----------------------------------------------------------------------------------------------*/

export const avatarExcessStyles = css(avatarStyles);

/* -------------------------------------------------------------------------------------------------
 * Avatar - image
 * -----------------------------------------------------------------------------------------------*/

export const avatarImageStyles = css({
  boxSize: "$full",
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

/* -------------------------------------------------------------------------------------------------
 * AvatarGroup
 * -----------------------------------------------------------------------------------------------*/

export const avatarGroupStyles = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "flex-start",
  flexDirection: "row",
});
