import { withBemModifiers } from "@hope-ui/utils";
import clsx from "clsx";
import { JSX, mergeProps, Show, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { createComponentWithAs, PropsWithAs } from "../factory";
import { useComponentConfig } from "../provider";
import { ButtonVariants } from "../theme";
import { ButtonIcon } from "./button-icon";
import { ButtonLoader } from "./button-loader";

export interface ButtonOptions extends ButtonVariants {
  /** If `true`, the button will be disabled. */
  disabled?: boolean;

  /** If `true`, the button will take all available width. */
  isFullWidth?: boolean;

  /** If `true`, the button will show a loading spinner. */
  isLoading?: boolean;

  /**
   * The label to show in the button when `loading` is true.
   * If no text is passed, it only shows the loader
   */
  loadingText?: string;

  /** Replace the loader component when `loading` is set to `true`. */
  loader?: JSX.Element;

  /**  If added, the button will show an icon before the button's label. */
  leftIcon?: JSX.Element;

  /** If added, the button will show an icon after the button's label. */
  rightIcon?: JSX.Element;
}

const baseClass = "hope-button";

type ButtonComponentProps = PropsWithAs<"button", ButtonOptions>;

function ButtonComponent(props: ButtonComponentProps) {
  const config = useComponentConfig("Button");

  //const buttonGroupContext = useButtonGroupContext();

  const defaultProps: ButtonComponentProps = {
    variant: config.defaultVariants?.variant,
    colorScheme: config.defaultVariants?.colorScheme,
    size: config.defaultVariants?.size,
    loaderPlacement: config.defaultVariants?.loaderPlacement,
    type: "button",
    role: "button",
  };

  props = mergeProps(defaultProps, props);
  const [local, contentProps, others] = splitProps(
    props,
    [
      "as",
      "class",
      "disabled",
      "isFullWidth",
      "isLoading",
      "loadingText",
      "loader",
      "loaderPlacement",
      "variant",
      "colorScheme",
      "size",
    ],
    ["children", "leftIcon", "rightIcon"]
  );

  const disabled = () => local.disabled; //?? buttonGroupContext?.state.disabled;

  const classes = () => {
    const variant =
      local.variant ?? /* buttonGroupContext?.state.variant ?? */ config.defaultVariants?.variant;

    // Ignore colorScheme for default variant.
    const colorScheme =
      variant === "default"
        ? null
        : local.colorScheme ??
          /* buttonGroupContext?.state.colorScheme ?? */
          config.defaultVariants?.colorScheme;

    const size = local.size ?? /* buttonGroupContext?.state.size ?? */ config.defaultVariants?.size;

    return clsx(
      local.class,
      baseClass,
      withBemModifiers(baseClass, [
        variant,
        colorScheme,
        size,
        local.isLoading ? "is-loading" : null,
        local.isFullWidth ? "is-full-width" : null,
      ])
    );
  };

  return (
    <Dynamic component={local.as ?? "button"} class={classes()} disabled={disabled()} {...others}>
      <Show when={local.isLoading && local.loaderPlacement === "start"}>
        <ButtonLoader withLoadingText={!!local.loadingText}>{local.loader}</ButtonLoader>
      </Show>

      <Show when={local.isLoading} fallback={<ButtonContent {...contentProps} />}>
        <Show
          when={local.loadingText}
          fallback={
            <span style={{ opacity: 0 }}>
              <ButtonContent {...contentProps} />
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
 * The Button component is used to trigger an action or event,
 * such as submitting a form, opening a dialog, canceling an action, or performing a delete operation.
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
