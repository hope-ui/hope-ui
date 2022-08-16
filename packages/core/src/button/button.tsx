import { createPolymorphicComponent, hope, mergeThemeProps } from "@hope-ui/styles";
import { mergeRefs } from "@solid-primitives/refs";
import { createMemo, createSignal, onMount, Show, splitProps } from "solid-js";

import { createTagName } from "../primitives/create-tag-name";
import { useStyleConfig } from "./button.styles";
import { ButtonIcon } from "./button-icon";
import { ButtonLoader } from "./button-loader";
import { isButton } from "./is-button";
import { ButtonContentProps, ButtonProps } from "./types";

export const Button = createPolymorphicComponent<"button", ButtonProps>(props => {
  let ref: HTMLButtonElement | undefined;

  props = mergeThemeProps(
    "Button",
    {
      loaderPlacement: "start",
    },
    props
  );

  const [local, others] = splitProps(props, [
    "ref",
    "children",
    "type",
    "as",
    "styleConfigOverride",
    "unstyled",
    "colorScheme",
    "variant",
    "size",
    "isFullWidth",
    "isLoading",
    "loaderPlacement",
    "loadingText",
    "loader",
    "isDisabled",
    "leftIcon",
    "rightIcon",
  ]);

  const tagName = createTagName(
    () => ref,
    () => props.as || "button"
  );

  const [isNativeButton, setIsNativeButton] = createSignal(
    tagName() != null &&
      isButton({
        tagName: tagName(),
        type: local.type,
      })
  );

  const type = createMemo(() => {
    if (local.type != null) {
      return local.type;
    }

    return isNativeButton() ? "button" : undefined;
  });

  const styles = useStyleConfig("Button", local);

  onMount(() => {
    ref != null && setIsNativeButton(isButton(ref));
  });

  return (
    <hope.button
      as={local.as}
      ref={mergeRefs(el => (ref = el), local.ref)}
      role={!isNativeButton() && tagName() !== "a" ? "button" : undefined}
      type={type()}
      tabIndex={!isNativeButton() ? 0 : undefined}
      disabled={local.isDisabled}
      __css={styles().root}
      {...others}
    >
      <Show when={local.isLoading && local.loaderPlacement === "start"}>
        <ButtonLoader hasLoadingText={!!local.loadingText}>{local.loader}</ButtonLoader>
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
        <ButtonLoader hasLoadingText={!!local.loadingText}>{local.loader}</ButtonLoader>
      </Show>
    </hope.button>
  );
});

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
