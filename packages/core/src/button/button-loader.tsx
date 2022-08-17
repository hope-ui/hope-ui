import { createHopeComponent, hope, useStyleConfigContext } from "@hope-ui/styles";
import { clsx } from "clsx";
import { Show, splitProps } from "solid-js";

import { IconSpinner } from "../icons/icon-spinner";
import { ButtonParts } from "./button.styles";
import { ButtonLoaderProps } from "./types";

export const ButtonLoader = createHopeComponent<"div", ButtonLoaderProps>(props => {
  const [local, others] = splitProps(props, ["class", "children", "hasLoadingText"]);

  const styles = useStyleConfigContext<ButtonParts>();

  return (
    <hope.div
      __css={styles().loaderWrapper}
      position={local.hasLoadingText ? "relative" : "absolute"}
      class={clsx("hope-button__loader", local.class)}
      {...others}
    >
      <Show when={local.children} fallback={<IconSpinner __css={styles().loaderIcon} />}>
        {local.children}
      </Show>
    </hope.div>
  );
});
