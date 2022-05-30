import { withBemModifiers } from "@hope-ui/utils";
import {
  AriaButtonProps,
  createButton,
  createFocusRing,
  createHover,
} from "@solid-aria/primitives";
import { combineProps } from "@solid-primitives/props";
import { mergeRefs } from "@solid-primitives/refs";
import clsx from "clsx";
import { createMemo, JSX, mergeProps, Show, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { createComponentWithAs, PropsWithAs } from "../factory";
import { useComponentConfig } from "../provider";
import { ButtonVariants } from "../theme";
import { useButtonGroupContext } from "./button-group";
import { ButtonIcon } from "./button-icon";
import { ButtonLoader } from "./button-loader";

export interface ButtonOptions extends ButtonVariants, Omit<AriaButtonProps, "elementType"> {
  /** If `true`, the button will take all available width. */
  isFullWidth?: boolean;

  /** If `true`, the button will show a loading spinner. */
  isLoading?: boolean;

  /** The label to show in the button when `loading` is true. */
  loadingText?: string;

  /** Replace the loader component when `loading` is set to `true`. */
  loader?: JSX.Element;

  /**  If added, the button will show an icon before the button's label. */
  leftIcon?: JSX.Element;

  /** If added, the button will show an icon after the button's label. */
  rightIcon?: JSX.Element;
}

export type ButtonComponentProps = PropsWithAs<"button", ButtonOptions>;

const baseClass = "hope-button";

function ButtonComponent(props: ButtonComponentProps) {
  let domRef: HTMLButtonElement | undefined;

  const config = useComponentConfig("Button");

  const buttonGroupContext = useButtonGroupContext();

  const defaultProps: ButtonComponentProps = {
    as: "button",
    variant: buttonGroupContext?.variant() ?? config.defaultVariants?.variant,
    colorScheme: buttonGroupContext?.colorScheme() ?? config.defaultVariants?.colorScheme,
    size: buttonGroupContext?.size() ?? config.defaultVariants?.size,
    loaderPlacement: config.defaultVariants?.loaderPlacement,
    isDisabled: buttonGroupContext?.isDisabled(),
  };

  // eslint-disable-next-line solid/reactivity
  props = mergeProps(defaultProps, props);

  const [local, others] = splitProps(props, [
    "ref",
    "as",
    "class",
    "children",
    // ButtonOptions
    "isFullWidth",
    "isLoading",
    "loadingText",
    "loader",
    "leftIcon",
    "rightIcon",
    // ButtonVariants
    "variant",
    "colorScheme",
    "size",
    "loaderPlacement",
    // AriaButtonProps
    "isDisabled",
    "preventFocusOnPress",
    "allowFocusWhenDisabled",
    "excludeFromTabOrder",
  ]);

  const isDisabled = () => local.isDisabled ?? buttonGroupContext?.isDisabled() ?? false;

  const createButtonProps = mergeProps(props, {
    get elementType() {
      return local.as;
    },
    get isDisabled() {
      return isDisabled();
    },
  } as AriaButtonProps);

  const { buttonProps, isPressed } = createButton(createButtonProps, () => domRef);
  const { hoverProps, isHovered } = createHover({ isDisabled });
  const { focusProps, isFocusVisible } = createFocusRing({ autoFocus: () => props.autoFocus });

  const rootProps = createMemo(() => combineProps(buttonProps(), hoverProps(), focusProps()));

  const classes = createMemo(() => {
    const variant =
      local.variant ?? buttonGroupContext?.variant() ?? config.defaultVariants?.variant;

    // Ignore colorScheme for default variant.
    const colorScheme =
      variant === "default"
        ? null
        : local.colorScheme ??
          buttonGroupContext?.colorScheme() ??
          config.defaultVariants?.colorScheme;

    const size = local.size ?? buttonGroupContext?.size() ?? config.defaultVariants?.size;

    return clsx(
      local.class,
      baseClass,
      isFocusVisible() && "hope-focus-ring",
      withBemModifiers(baseClass, [
        variant,
        colorScheme,
        size,
        local.isLoading ? "is-loading" : null,
        local.isFullWidth ? "is-full-width" : null,
        isHovered() ? "is-hovered" : null,
        isPressed() ? "is-active" : null,
        isDisabled() ? "is-disabled" : null,
      ])
    );
  });

  return (
    <Dynamic
      component={local.as}
      class={classes()}
      {...others}
      {...rootProps()}
      ref={mergeRefs(el => (domRef = el), local.ref)}
    >
      <Show when={local.isLoading && local.loaderPlacement === "start"}>
        <ButtonLoader withLoadingText={!!local.loadingText}>{local.loader}</ButtonLoader>
      </Show>

      <Show when={local.isLoading} fallback={<ButtonContent {...local} />}>
        <Show
          when={local.loadingText}
          fallback={
            <span style={{ opacity: 0 }}>
              <ButtonContent {...local} />
            </span>
          }
        >
          {local.loadingText}
        </Show>
      </Show>

      <Show when={local.isLoading && local.loaderPlacement === "end"}>
        <ButtonLoader withLoadingText={!!local.loadingText}>{local.loader}</ButtonLoader>
      </Show>
    </Dynamic>
  );
}

/**
 * Button is used to trigger an action or event, such as submitting a form,
 * opening a dialog, canceling an action, or performing a delete operation.
 */
export const Button = createComponentWithAs<"button", ButtonOptions>(ButtonComponent);

/* -------------------------------------------------------------------------------------------------
 * ButtonContent
 * -----------------------------------------------------------------------------------------------*/

type ButtonContentProps = Pick<ButtonComponentProps, "leftIcon" | "rightIcon" | "children">;

function ButtonContent(props: ButtonContentProps) {
  return (
    <>
      <Show when={props.leftIcon}>
        <ButtonIcon>{props.leftIcon}</ButtonIcon>
      </Show>
      {props.children}
      <Show when={props.rightIcon}>
        <ButtonIcon>{props.rightIcon}</ButtonIcon>
      </Show>
    </>
  );
}
