import { createPolymorphicComponent, hope } from "@hope-ui/styles";
import { clsx } from "clsx";
import { Show, splitProps } from "solid-js";

import { IconSpinner } from "../icons/icon-spinner";
import { ButtonLoaderProps } from "./types";

export const ButtonLoader = createPolymorphicComponent<"div", ButtonLoaderProps>(props => {
  const [local, others] = splitProps(props, ["class", "children"]);

  return (
    <hope.div class={clsx("hope-button__loader", local.class)} {...others}>
      <Show when={local.children} fallback={<IconSpinner class="hope-button__icon-spinner" />}>
        {local.children}
      </Show>
    </hope.div>
  );
});
