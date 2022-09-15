/*!
 * Original code by Chakra UI
 * MIT Licensed, Copyright (c) 2019 Segun Adebayo.
 *
 * Credits to the Chakra UI team:
 * https://github.com/chakra-ui/chakra-ui/blob/main/packages/layout/src/kbd.tsx
 */

import {
  ComponentTheme,
  createHopeComponent,
  hope,
  STYLE_CONFIG_PROP_NAMES,
} from "@hope-ui/styles";
import { clsx } from "clsx";
import { splitProps } from "solid-js";

import { KbdStyleConfigProps, useKbdStyleConfig } from "./kbd.styles";

export interface KbdProps extends KbdStyleConfigProps {}

export type KbdTheme = ComponentTheme<KbdProps>;

/**
 * `Kbd` is a semantic component used to render keyboard shortcut.
 */
export const Kbd = createHopeComponent<"kbd", KbdProps>(props => {
  const [local, styleConfigProps, others] = splitProps(props, ["class"], STYLE_CONFIG_PROP_NAMES);

  const { baseClasses, styleOverrides } = useKbdStyleConfig("Kbd", styleConfigProps);

  return (
    <hope.kbd
      class={clsx(baseClasses().root, local.class)}
      __css={styleOverrides().root}
      {...others}
    />
  );
});
