import { createPolymorphicComponent, hope, mergeThemeProps } from "@hope-ui/styles";
import { splitProps } from "solid-js";

import { useStyleConfig } from "./button.styles";
import { ButtonProps } from "./types";

export const Button = createPolymorphicComponent<"button", ButtonProps>(props => {
  props = mergeThemeProps("Button", {}, props);

  const [local, others] = splitProps(props, [
    "styleConfigOverride",
    "unstyled",
    "colorScheme",
    "variant",
    "size",
    "isFullWidth",
    "isLoading",
  ]);

  const styles = useStyleConfig("Button", local);

  return <hope.button __css={styles().root} {...others} />;
});
