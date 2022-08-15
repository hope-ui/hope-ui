import { createPolymorphicComponent, hope, mergeThemeProps } from "@hope-ui/styles";
import { stringOrUndefined } from "@hope-ui/utils";
import { mergeRefs } from "@solid-primitives/refs";
import { createMemo, splitProps } from "solid-js";

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

  const tagName = createMemo(() => {
    return stringOrUndefined(ref?.tagName?.toLowerCase() || local.as || "button");
  });

  const isNativeButton = createMemo(() => {
    return tagName() != null && isButton(tagName(), local.type);
  });

  const type = createMemo(() => {
    if (local.type != null) {
      return local.type;
    }

    return isNativeButton() ? "button" : undefined;
  });

  const styles = useStyleConfig("Button", local);

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
