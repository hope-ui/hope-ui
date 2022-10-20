/*!
 * Portions of this file are based on code from chakra-ui.
 * MIT Licensed, Copyright (c) 2019 Segun Adebayo.
 *
 * Credits to the Chakra UI team:
 * https://github.com/chakra-ui/chakra-ui/blob/7d7e04d53d871e324debe0a2cb3ff44d7dbf3bca/packages/components/button/src/button-icon.tsx
 */

import { createHopeComponent, hope } from "@hope-ui/styles";
import { clsx } from "clsx";
import { splitProps } from "solid-js";

import { useButtonContext } from "./button-context";

export const ButtonIcon = createHopeComponent<"span">(props => {
  const buttonContext = useButtonContext();

  const [local, others] = splitProps(props, ["class", "__css"]);

  return (
    <hope.span
      aria-hidden={true}
      class={clsx(buttonContext.baseClasses().icon, local.class)}
      __css={{ ...buttonContext.styleOverrides().icon, ...local.__css }}
      {...others}
    />
  );
});
