import { createPolymorphicComponent, hope, mergeWithThemeProps } from "@hope-ui/styles";
import { splitProps } from "solid-js";

import { ButtonParams, useRecipe } from "./button.styles";
import { ButtonProps } from "./types";

export const Button = createPolymorphicComponent<"button", ButtonProps>(props => {
  props = mergeWithThemeProps(
    "Button",
    {
      colorScheme: "primary",
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

  const classes = useRecipe({
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

  return <hope.button class={classes().root} {...others} />;
});
