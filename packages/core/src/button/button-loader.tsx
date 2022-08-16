import { createPolymorphicComponent, hope, spin, SystemStyleObject } from "@hope-ui/styles";
import { clsx } from "clsx";
import { Accessor, createMemo, Show, splitProps } from "solid-js";

import { IconSpinner } from "../icons/icon-spinner";
import { ButtonLoaderProps } from "./types";

export const ButtonLoader = createPolymorphicComponent<"div", ButtonLoaderProps>(props => {
  const [local, others] = splitProps(props, ["class", "children", "hasLoadingText"]);

  const loaderStyles: Accessor<SystemStyleObject> = createMemo(() => ({
    position: local.hasLoadingText ? "relative" : "absolute",
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
    fontSize: "1em",
    lineHeight: "normal",
  }));

  const iconStyles: SystemStyleObject = {
    fontSize: "1.3em",
    animation: `1s linear infinite ${spin}`,
  };

  return (
    <hope.div __css={loaderStyles()} class={clsx("hope-button__loader", local.class)} {...others}>
      <Show when={local.children} fallback={<IconSpinner __css={iconStyles} />}>
        {local.children}
      </Show>
    </hope.div>
  );
});
