import { mergeProps, Show, splitProps } from "solid-js";

import { useHopeTheme } from "@/contexts/HopeContext";
import { IconSpinner } from "@/icons/IconSpinner";
import { spin } from "@/styled-system/keyframes";
import { css } from "@/styled-system/stitches.config";

import { hope } from "../factory";
import { ElementType } from "../types";
import { ButtonProps } from ".";

const buttonLoadingIcon = css({
  animation: `1000ms linear infinite ${spin}`,
});

export const iconButton = css({});

export const BaseButton = hope("button", {
  appearance: "none",
  position: "relative",

  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",

  padding: "0",

  fontWeight: "$semibold",
  lineHeight: "$none",
  textDecoration: "none",

  cursor: "pointer",
  userSelect: "none",
  outline: "none",
  transition: "color 250ms, background-color 250ms",

  "&:active": {
    transform: "translateY(1px)",
  },

  "&:focus-visible": {
    outline: "2px solid #2563eb",
    outlineOffset: "4px",
  },

  "&:disabled": {
    border: "1px solid transparent",
    backgroundColor: "$neutral100",
    color: "$neutral300",
    cursor: "not-allowed",
  },

  variants: {
    variant: {
      default: {
        border: "1px solid $neutral400",
        backgroundColor: "white",
        color: "$dark600",

        "&:not(:disabled):hover": {
          backgroundColor: "$neutral100",
        },
      },
      filled: {
        border: "1px solid transparent",
        color: "white",
      },
      light: {
        border: "1px solid transparent",
      },
      outline: {
        borderStyle: "solid",
        borderWidth: "1px",
        backgroundColor: "transparent",
      },
      dashed: {
        borderStyle: "dashed",
        borderWidth: "1px",
        backgroundColor: "transparent",
      },
      text: {
        border: "1px solid transparent",
        backgroundColor: "transparent",
      },
    },
    color: {
      primary: {},
      dark: {},
      neutral: {},
      success: {},
      info: {},
      warning: {},
      danger: {},
    },
    size: {
      xs: {
        height: "$6",
        padding: "0 $2",
        fontSize: "$xs",

        [`&.${iconButton}`]: {
          width: "$6",
          padding: "0",
        },

        "& svg": {
          boxSize: "$3-5",
        },

        "& > * + *": {
          marginLeft: "$1",
        },
      },
      sm: {
        height: "$8",
        padding: "0 $3",
        fontSize: "$sm",

        [`&.${iconButton}`]: {
          width: "$8",
          padding: "0",
        },

        "& svg": {
          boxSize: "$4",
        },

        "& > * + *": {
          marginLeft: "$1-5",
        },
      },
      md: {
        height: "$10",
        padding: "0 $4",
        fontSize: "$base",

        [`&.${iconButton}`]: {
          width: "$10",
          padding: "0",
        },

        "& svg": {
          boxSize: "$5",
        },

        "& > * + *": {
          marginLeft: "$1-5",
        },
      },
      lg: {
        height: "$12",
        padding: "0 $6",
        fontSize: "$lg",

        [`&.${iconButton}`]: {
          width: "$12",
          padding: "0",
        },

        "& svg": {
          boxSize: "$6",
        },

        "& > * + *": {
          marginLeft: "$2",
        },
      },
      xl: {
        height: "$14",
        padding: "0 $8",
        fontSize: "$xl",

        [`&.${iconButton}`]: {
          width: "$14",
          padding: "0",
        },

        "& svg": {
          boxSize: "$7",
        },

        "& > * + *": {
          marginLeft: "$2",
        },
      },
    },
    radius: {
      none: {
        borderRadius: "0",
      },
      xs: {
        borderRadius: "$xs",
      },
      sm: {
        borderRadius: "$sm",
      },
      md: {
        borderRadius: "$md",
      },
      lg: {
        borderRadius: "$lg",
      },
      xl: {
        borderRadius: "$xl",
      },
      full: {
        borderRadius: "$full",
      },
    },
    compact: {
      true: {},
    },
    uppercase: {
      true: {
        textTransform: "uppercase",
      },
    },
    fullWidth: {
      true: {
        display: "flex",
        width: "100%",
      },
    },
    loading: {
      true: {
        opacity: "0.75",
        cursor: "default",
        pointerEvents: "none",
      },
    },
  },

  compoundVariants: [
    /**
     * Variant filled
     ******************************/
    {
      variant: "filled",
      color: "primary",
      css: {
        backgroundColor: "$primary500",
        "&:not(:disabled):hover": {
          backgroundColor: "$primary600",
        },
      },
    },
    {
      variant: "filled",
      color: "dark",
      css: {
        backgroundColor: "$dark500",
        "&:not(:disabled):hover": {
          backgroundColor: "$dark800",
        },
      },
    },
    {
      variant: "filled",
      color: "neutral",
      css: {
        backgroundColor: "$neutral500",
        "&:not(:disabled):hover": {
          backgroundColor: "$neutral600",
        },
      },
    },
    {
      variant: "filled",
      color: "success",
      css: {
        backgroundColor: "$success500",
        "&:not(:disabled):hover": {
          backgroundColor: "$success600",
        },
      },
    },
    {
      variant: "filled",
      color: "info",
      css: {
        backgroundColor: "$info500",
        "&:not(:disabled):hover": {
          backgroundColor: "$info600",
        },
      },
    },
    {
      variant: "filled",
      color: "warning",
      css: {
        backgroundColor: "$warning500",
        "&:not(:disabled):hover": {
          backgroundColor: "$warning600",
        },
      },
    },
    {
      variant: "filled",
      color: "danger",
      css: {
        backgroundColor: "$danger500",
        "&:not(:disabled):hover": {
          backgroundColor: "$danger600",
        },
      },
    },
    /**
     * Variant light
     ******************************/
    {
      variant: "light",
      color: "primary",
      css: {
        backgroundColor: "$primary50",
        color: "$primary600",
        "&:not(:disabled):hover": {
          backgroundColor: "$primary100",
        },
      },
    },
    {
      variant: "light",
      color: "dark",
      css: {
        backgroundColor: "$dark50",
        color: "$dark800",
        "&:not(:disabled):hover": {
          backgroundColor: "$dark100",
        },
      },
    },
    {
      variant: "light",
      color: "neutral",
      css: {
        backgroundColor: "$neutral100",
        color: "$neutral600",
        "&:not(:disabled):hover": {
          backgroundColor: "$neutral200",
        },
      },
    },
    {
      variant: "light",
      color: "success",
      css: {
        backgroundColor: "$success50",
        color: "$success600",
        "&:not(:disabled):hover": {
          backgroundColor: "$success100",
        },
      },
    },
    {
      variant: "light",
      color: "info",
      css: {
        backgroundColor: "$info50",
        color: "$info600",
        "&:not(:disabled):hover": {
          backgroundColor: "$info100",
        },
      },
    },
    {
      variant: "light",
      color: "warning",
      css: {
        backgroundColor: "$warning50",
        color: "$warning600",
        "&:not(:disabled):hover": {
          backgroundColor: "$warning100",
        },
      },
    },
    {
      variant: "light",
      color: "danger",
      css: {
        backgroundColor: "$danger50",
        color: "$danger600",
        "&:not(:disabled):hover": {
          backgroundColor: "$danger100",
        },
      },
    },
    /**
     * Variant outline
     ******************************/
    {
      variant: "outline",
      color: "primary",
      css: {
        borderColor: "$primary600",
        color: "$primary600",
        "&:not(:disabled):hover": {
          backgroundColor: "$primary50",
        },
      },
    },
    {
      variant: "outline",
      color: "dark",
      css: {
        borderColor: "$dark600",
        color: "$dark600",
        "&:not(:disabled):hover": {
          backgroundColor: "$dark50",
        },
      },
    },
    {
      variant: "outline",
      color: "neutral",
      css: {
        borderColor: "$neutral600",
        color: "$neutral600",
        "&:not(:disabled):hover": {
          backgroundColor: "$neutral100",
        },
      },
    },
    {
      variant: "outline",
      color: "success",
      css: {
        borderColor: "$success600",
        color: "$success600",
        "&:not(:disabled):hover": {
          backgroundColor: "$success50",
        },
      },
    },
    {
      variant: "outline",
      color: "info",
      css: {
        borderColor: "$info600",
        color: "$info600",
        "&:not(:disabled):hover": {
          backgroundColor: "$info50",
        },
      },
    },
    {
      variant: "outline",
      color: "warning",
      css: {
        borderColor: "$warning600",
        color: "$warning600",
        "&:not(:disabled):hover": {
          backgroundColor: "$warning50",
        },
      },
    },
    {
      variant: "outline",
      color: "danger",
      css: {
        borderColor: "$danger600",
        color: "$danger600",
        "&:not(:disabled):hover": {
          backgroundColor: "$danger50",
        },
      },
    },
    /**
     * Variant dashed
     ******************************/
    {
      variant: "dashed",
      color: "primary",
      css: {
        borderColor: "$primary600",
        color: "$primary600",
        "&:not(:disabled):hover": {
          backgroundColor: "$primary50",
        },
      },
    },
    {
      variant: "dashed",
      color: "dark",
      css: {
        borderColor: "$dark600",
        color: "$dark600",
        "&:not(:disabled):hover": {
          backgroundColor: "$dark50",
        },
      },
    },
    {
      variant: "dashed",
      color: "neutral",
      css: {
        borderColor: "$neutral600",
        color: "$neutral600",
        "&:not(:disabled):hover": {
          backgroundColor: "$neutral100",
        },
      },
    },
    {
      variant: "dashed",
      color: "success",
      css: {
        borderColor: "$success600",
        color: "$success600",
        "&:not(:disabled):hover": {
          backgroundColor: "$success50",
        },
      },
    },
    {
      variant: "dashed",
      color: "info",
      css: {
        borderColor: "$info600",
        color: "$info600",
        "&:not(:disabled):hover": {
          backgroundColor: "$info50",
        },
      },
    },
    {
      variant: "dashed",
      color: "warning",
      css: {
        borderColor: "$warning600",
        color: "$warning600",
        "&:not(:disabled):hover": {
          backgroundColor: "$warning50",
        },
      },
    },
    {
      variant: "dashed",
      color: "danger",
      css: {
        borderColor: "$danger600",
        color: "$danger600",
        "&:not(:disabled):hover": {
          backgroundColor: "$danger50",
        },
      },
    },
    /**
     * Variant text
     ******************************/
    {
      variant: "text",
      color: "primary",
      css: {
        color: "$primary600",
        "&:not(:disabled):hover": {
          backgroundColor: "$primary50",
        },
      },
    },
    {
      variant: "text",
      color: "dark",
      css: {
        color: "$dark600",
        "&:not(:disabled):hover": {
          backgroundColor: "$dark50",
        },
      },
    },
    {
      variant: "text",
      color: "neutral",
      css: {
        color: "$neutral600",
        "&:not(:disabled):hover": {
          backgroundColor: "$neutral100",
        },
      },
    },
    {
      variant: "text",
      color: "success",
      css: {
        color: "$success600",
        "&:not(:disabled):hover": {
          backgroundColor: "$success50",
        },
      },
    },
    {
      variant: "text",
      color: "info",
      css: {
        color: "$info600",
        "&:not(:disabled):hover": {
          backgroundColor: "$info50",
        },
      },
    },
    {
      variant: "text",
      color: "warning",
      css: {
        color: "$warning600",
        "&:not(:disabled):hover": {
          backgroundColor: "$warning50",
        },
      },
    },
    {
      variant: "text",
      color: "danger",
      css: {
        color: "$danger600",
        "&:not(:disabled):hover": {
          backgroundColor: "$danger50",
        },
      },
    },
    /**
     * Compact sizes
     ******************************/
    {
      size: "xs",
      compact: "true",
      css: {
        height: "$5",
        padding: "0 $1",

        [`&.${iconButton}`]: {
          width: "$5",
          padding: "0",
        },
      },
    },
    {
      size: "sm",
      compact: "true",
      css: {
        height: "$6",
        padding: "0 $1-5",

        [`&.${iconButton}`]: {
          width: "$6",
          padding: "0",
        },
      },
    },
    {
      size: "md",
      compact: "true",
      css: {
        height: "$7",
        padding: "0 $1-5",

        [`&.${iconButton}`]: {
          width: "$7",
          padding: "0",
        },
      },
    },
    {
      size: "lg",
      compact: "true",
      css: {
        height: "$8",
        padding: "0 $1-5",

        [`&.${iconButton}`]: {
          width: "$8",
          padding: "0",
        },
      },
    },
    {
      size: "xl",
      compact: "true",
      css: {
        height: "$9",
        padding: "0 $2",

        [`&.${iconButton}`]: {
          width: "$9",
          padding: "0",
        },
      },
    },
  ],
});

export function Button<C extends ElementType = "button">(props: ButtonProps<C>) {
  const theme = useHopeTheme().components.Button;

  const defaultProps: ButtonProps<"button"> = {
    as: "button",
    variant: theme.variant,
    color: theme.color,
    size: theme.size,
    radius: theme.radius,
    loaderPosition: theme.loaderPosition,
    compact: theme.compact,
    uppercase: theme.uppercase,
    fullWidth: theme.fullWidth,
    loading: false,
    disabled: false,
    type: "button",
    role: "button",
  };

  const propsWithDefault = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, [
    "loaderPosition",
    "loading",
    "disabled",
    "leftIcon",
    "rightIcon",
    "children",
  ]);

  const isLeftIconVisible = () => {
    return local.leftIcon && (!local.loading || local.loaderPosition === "right");
  };

  const isRightIconVisible = () => {
    return local.rightIcon && (!local.loading || local.loaderPosition === "left");
  };

  const isLoadingSpinnerLeftVisible = () => {
    return local.loading && !local.disabled && local.loaderPosition === "left";
  };

  const isLoadingSpinnerRightVisible = () => {
    return local.loading && !local.disabled && local.loaderPosition === "right";
  };

  const shouldWrapChildrenInSpan = () => {
    return local.leftIcon || local.rightIcon || local.loading;
  };

  return (
    <BaseButton disabled={local.disabled} loading={local.loading} {...others}>
      <Show when={isLeftIconVisible()}>{local.leftIcon}</Show>
      <Show when={isLoadingSpinnerLeftVisible()}>
        <IconSpinner className={buttonLoadingIcon()} />
      </Show>
      <Show when={shouldWrapChildrenInSpan()} fallback={local.children}>
        <span>{local.children}</span>
      </Show>
      <Show when={isRightIconVisible()}>{local.rightIcon}</Show>
      <Show when={isLoadingSpinnerRightVisible()}>
        <IconSpinner className={buttonLoadingIcon()} />
      </Show>
    </BaseButton>
  );
}

Button.className = BaseButton.className;
Button.displayName = BaseButton.displayName;
Button.selector = BaseButton.selector;
Button.toString = () => BaseButton.selector;
