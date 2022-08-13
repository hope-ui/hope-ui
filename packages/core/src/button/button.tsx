import { createPolymorphicComponent, hope, mergeThemeProps } from "@hope-ui/styles";
import { splitProps } from "solid-js";

import { ButtonParams, useStyles } from "./button.styles";
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
    "styles",
    "unstyled",
    "colorScheme",
    "variant",
    "size",
    "isFullWidth",
    "isLoading",
  ]);

  const styles = useStyles({
    name: "Button",
    params: local as ButtonParams,
    variants: local,
    get styles() {
      return local.styles;
    },
    get unstyled() {
      return local.unstyled;
    },
  });

  return <hope.button __css={styles().root} {...others} />;
});
