import { createPolymorphicComponent, hope, mergeThemeProps } from "@hope-ui/styles";
import { splitProps } from "solid-js";

import { ButtonParams, useStyleConfig } from "./button.styles";
import { ButtonProps } from "./types";

export const Button = createPolymorphicComponent<"button", ButtonProps>(props => {
  props = mergeThemeProps(
    "Button",
    {
      colorScheme: "neutral",
    },
    props
  );

  const [local, others] = splitProps(props, [
    "styleConfig",
    "unstyled",
    "colorScheme",
    "variant",
    "size",
    "isFullWidth",
    "isLoading",
  ]);

  const styles = useStyleConfig({
    name: "Button",
    params: local as ButtonParams,
    variants: local,
    get styleConfig() {
      return local.styleConfig;
    },
    get unstyled() {
      return local.unstyled;
    },
  });

  return <hope.button __css={styles().root} {...others} />;
});
