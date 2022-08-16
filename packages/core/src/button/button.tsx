import { createPolymorphicComponent, hope, mergeThemeProps } from "@hope-ui/styles";
import { mergeRefs } from "@solid-primitives/refs";
import { createMemo, createSignal, onMount, splitProps } from "solid-js";

import { createTagName } from "../primitives/create-tag-name";
import { useStyleConfig } from "./button.styles";
import { isButton } from "./is-button";
import { ButtonProps } from "./types";

export const Button = createPolymorphicComponent<"button", ButtonProps>(props => {
  let ref: HTMLButtonElement | undefined;

  props = mergeThemeProps("Button", {}, props);

  const [local, others] = splitProps(props, [
    // SolidJS props
    "ref",
    // DOM props
    "type",
    // Hope UI props
    "as",
    "styleConfigOverride",
    "unstyled",
    "colorScheme",
    // Component props
    "variant",
    "size",
    "isFullWidth",
    "isLoading",
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
      __css={styles().root}
      {...others}
    />
  );
});
