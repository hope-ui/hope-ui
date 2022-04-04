import { VariantProps } from "@stitches/core";

import { css } from "@/styled-system/stitches.config";

/* -------------------------------------------------------------------------------------------------
 * NotificationIcon
 * -----------------------------------------------------------------------------------------------*/

export const notificationIconStyles = css({
  flexShrink: 0,

  variants: {
    status: {
      success: { color: "$success9" },
      info: { color: "$info9" },
      warning: { color: "$warning9" },
      danger: { color: "$danger9" },
    },
  },
});

/* -------------------------------------------------------------------------------------------------
 * NotificationTitle
 * -----------------------------------------------------------------------------------------------*/

export const notificationTitleStyles = css({
  mb: "$1",
  fontWeight: "$medium",
});

/* -------------------------------------------------------------------------------------------------
 * NotificationDescription
 * -----------------------------------------------------------------------------------------------*/

export const notificationDescriptionStyles = css({
  display: "inline-block",
  color: "$neutral11",
});

/* -------------------------------------------------------------------------------------------------
 * Notification
 * -----------------------------------------------------------------------------------------------*/

export const notificationStyles = css({
  position: "relative",
  display: "flex",
  alignItems: "center",

  width: "max-content",
  maxWidth: "$md",

  borderRadius: "$sm",
  border: "1px solid $colors$neutral5",

  boxShadow: "$lg",

  px: "$4",
  py: "$3",

  fontSize: "$sm",
  lineHeight: "$5",

  variants: {
    status: {
      success: {},
      info: {},
      warning: {},
      danger: {},
    },
  },
});

export type NotificationVariants = VariantProps<typeof notificationStyles>;
