/*!
 * Portions of this file are based on code from chakra-ui.
 * MIT Licensed, Copyright (c) 2019 Segun Adebayo.
 *
 * Credits to the Chakra UI team:
 * https://github.com/chakra-ui/chakra-ui/blob/7d7e04d53d871e324debe0a2cb3ff44d7dbf3bca/packages/components/button/src/button-spinner.tsx
 */

import { createHopeComponent, hope } from "@hope-ui/styles";
import { clsx } from "clsx";
import { Show, splitProps } from "solid-js";

import { SpinnerIcon } from "../icon/icon-set";
import { useButtonContext } from "./button-context";
import { ButtonLoaderProps } from "./types";

export const ButtonLoader = createHopeComponent<"div", ButtonLoaderProps>(props => {
  const buttonContext = useButtonContext();

  const [local, others] = splitProps(props, ["class", "children", "hasLoadingText"]);

  return (
    <hope.div
      class={clsx(buttonContext.baseClasses().loaderWrapper, local.class)}
      position={local.hasLoadingText ? "relative" : "absolute"}
      __css={buttonContext.styleOverrides().loaderWrapper}
      {...others}
    >
      <Show
        when={local.children}
        fallback={
          <SpinnerIcon
            class={buttonContext.baseClasses().loaderIcon}
            __css={buttonContext.styleOverrides().loaderIcon}
          />
        }
      >
        {local.children}
      </Show>
    </hope.div>
  );
});
