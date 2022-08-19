import { createHopeComponent, hope, useStyleConfigContext } from "@hope-ui/styles";
import { clsx } from "clsx";
import { Show, splitProps } from "solid-js";

import { IconSpinner } from "../icons/icon-spinner";
import { ButtonParts } from "./button.styles";
import { ButtonLoaderProps } from "./types";

export const ButtonLoader = createHopeComponent<"div", ButtonLoaderProps>(props => {
  const [local, others] = splitProps(props, ["class", "children", "hasLoadingText"]);

  const { classes, styleOverrides } = useStyleConfigContext<ButtonParts>();

  return (
    <hope.div
      class={clsx(classes().loaderWrapper, local.class)}
      position={local.hasLoadingText ? "relative" : "absolute"}
      __css={styleOverrides().loaderWrapper}
      {...others}
    >
      <Show
        when={local.children}
        fallback={<IconSpinner class={classes().loaderIcon} __css={styleOverrides().loaderIcon} />}
      >
        {local.children}
      </Show>
    </hope.div>
  );
});
