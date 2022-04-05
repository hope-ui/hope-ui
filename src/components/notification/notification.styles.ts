import { VariantProps } from "@stitches/core";

import { css, globalCss } from "@/styled-system/stitches.config";

/* -------------------------------------------------------------------------------------------------
 * Notification - solid-transition-group classes
 * -----------------------------------------------------------------------------------------------*/

export const notificationTransitionName = {
  slideInTop: "hope-notification-slide-in-top-transition",
  slideInRight: "hope-notification-slide-in-right-transition",
  slideInBottom: "hope-notification-slide-in-bottom-transition",
  slideInLeft: "hope-notification-slide-in-left-transition",
};

function createNotificationSlideTransition(config: { name: string; enterTransform: string; leaveTransform: string }) {
  return {
    [`.${config.name}-enter, .${config.name}-exit-to`]: {
      opacity: 0,
      transform: config.enterTransform,
    },
    [`.${config.name}-enter-to, .${config.name}-exit`]: {
      opacity: 1,
      transform: config.leaveTransform,
    },
    [`.${config.name}-enter-active`]: {
      transitionProperty: "opacity, transform",
      transitionTimingFunction: "cubic-bezier(.51,.3,0,1.21)",
      transitionDuration: "300ms",
    },
    [`.${config.name}-exit-active`]: {
      transitionProperty: "opacity, transform",
      transitionTimingFunction: "ease-in",
      transitionDuration: "200ms",
    },
  };
}

export const notificationTransitionStyles = globalCss({
  ...createNotificationSlideTransition({
    name: notificationTransitionName.slideInTop,
    enterTransform: "translateY(-100%)",
    leaveTransform: "translateY(0)",
  }),
  ...createNotificationSlideTransition({
    name: notificationTransitionName.slideInRight,
    enterTransform: "translateX(100%)",
    leaveTransform: "translateX(0)",
  }),
  ...createNotificationSlideTransition({
    name: notificationTransitionName.slideInBottom,
    enterTransform: "translateY(100%)",
    leaveTransform: "translateY(0)",
  }),
  ...createNotificationSlideTransition({
    name: notificationTransitionName.slideInLeft,
    enterTransform: "translateX(-100%)",
    leaveTransform: "translateX(0)",
  }),
});

/* -------------------------------------------------------------------------------------------------
 * Notification - list
 * -----------------------------------------------------------------------------------------------*/

export const notificationListStyles = css({
  position: "fixed",
  zIndex: "$notification",

  display: "flex",
  flexDirection: "column",
  gap: "$4",

  variants: {
    placement: {
      "top-start": {
        top: "$4",
        left: "$4",
      },
      top: {
        top: "$4",
        left: "50%",
        transform: "translateX(-50%)",
      },
      "top-end": {
        top: "$4",
        right: "$4",
      },
      "bottom-start": {
        bottom: "$4",
        left: "$4",
      },
      bottom: {
        bottom: "$4",
        left: "50%",
        transform: "translateX(-50%)",
      },
      "bottom-end": {
        bottom: "$4",
        right: "$4",
      },
    },
  },

  defaultVariants: {
    placement: "top-end",
  },
});

export type NotificationListVariants = VariantProps<typeof notificationListStyles>;

/* -------------------------------------------------------------------------------------------------
 * Notification
 * -----------------------------------------------------------------------------------------------*/

export const notificationStyles = css({
  position: "relative",
  display: "flex",
  alignItems: "center",

  minWidth: "$xs",
  maxWidth: "$md",

  borderRadius: "$sm",
  border: "1px solid $colors$neutral5",

  boxShadow: "$lg",

  backgroundColor: "$loContrast",

  padding: "$3",

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
  fontWeight: "$medium",
});

/* -------------------------------------------------------------------------------------------------
 * NotificationDescription
 * -----------------------------------------------------------------------------------------------*/

export const notificationDescriptionStyles = css({
  display: "inline-block",
  color: "$neutral11",
});
