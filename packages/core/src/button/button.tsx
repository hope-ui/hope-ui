/*!
 * Portions of this file are based on code from chakra-ui.
 * MIT Licensed, Copyright (c) 2019 Segun Adebayo.
 *
 * Credits to the Chakra UI team:
 * https://github.com/chakra-ui/chakra-ui/blob/7d7e04d53d871e324debe0a2cb3ff44d7dbf3bca/packages/components/button/src/button.tsx
 */

import { createTagName } from "@hope-ui/primitives";
import {
  createHopeComponent,
  hope,
  mergeThemeProps,
  StyleConfigProvider,
  useStyleConfigContext,
} from "@hope-ui/styles";
import { mergeRefs } from "@hope-ui/utils";
import { clsx } from "clsx";
import { createMemo, createSignal, onMount, Show, splitProps } from "solid-js";

import { ButtonParts, useButtonStyleConfig } from "./button.styles";
import { ButtonIcon } from "./button-icon";
import { ButtonLoader } from "./button-loader";
import { isButton } from "./is-button";
import { ButtonContentProps, ButtonProps } from "./types";

/**
 * Button is used to trigger an action or event,
 * such as submitting a form, opening a dialog, canceling an action, or performing a delete operation.
 */
export const Button = createHopeComponent<"button", ButtonProps>(props => {
  let ref: HTMLButtonElement | undefined;

  props = mergeThemeProps("Button", { loaderPlacement: "start" }, props);

  const [local, contentProps, styleConfigProps, others] = splitProps(
    props,
    [
      "ref",
      "class",
      "type",
      "as",
      "isLoading",
      "loaderPlacement",
      "loadingText",
      "loader",
      "isDisabled",
    ],
    ["children", "leftIcon", "rightIcon"],
    ["styleConfig", "unstyled", "colorScheme", "variant", "size", "isFullWidth", "isIconButton"]
  );

  const tagName = createTagName(
    () => ref,
    () => props.as || "button"
  );

  const [isNativeButton, setIsNativeButton] = createSignal(
    tagName() != null && isButton({ tagName: tagName(), type: local.type })
  );

  const type = createMemo(() => {
    if (local.type != null) {
      return local.type;
    }

    return isNativeButton() ? "button" : undefined;
  });

  const { classes, styles } = useButtonStyleConfig("Button", styleConfigProps);

  onMount(() => {
    ref != null && setIsNativeButton(isButton(ref));
  });

  return (
    <StyleConfigProvider value={{ classes, styles }}>
      <hope.button
        as={local.as}
        ref={mergeRefs(el => (ref = el), local.ref)}
        role={!isNativeButton() && tagName() !== "a" ? "button" : undefined}
        type={type()}
        tabIndex={!isNativeButton() ? 0 : undefined}
        disabled={local.isDisabled}
        data-loading={local.isLoading || undefined}
        class={clsx(classes().root, local.class)}
        __css={styles().root}
        {...others}
      >
        <Show when={local.isLoading && local.loaderPlacement === "start"}>
          <ButtonLoader hasLoadingText={!!local.loadingText}>{local.loader}</ButtonLoader>
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
          <ButtonLoader hasLoadingText={!!local.loadingText}>{local.loader}</ButtonLoader>
        </Show>
      </hope.button>
    </StyleConfigProvider>
  );
});

function ButtonContent(props: ButtonContentProps) {
  const { classes, styles } = useStyleConfigContext<ButtonParts>();

  return (
    <>
      <Show when={props.leftIcon}>
        <ButtonIcon class={classes().leftIcon} __css={styles().leftIcon}>
          {props.leftIcon}
        </ButtonIcon>
      </Show>
      {props.children}
      <Show when={props.rightIcon}>
        <ButtonIcon class={classes().rightIcon} __css={styles().rightIcon}>
          {props.rightIcon}
        </ButtonIcon>
      </Show>
    </>
  );
}
