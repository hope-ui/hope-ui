/*!
 * Original code by Chakra UI
 * MIT Licensed, Copyright (c) 2019 Segun Adebayo.
 *
 * Credits to the Chakra UI team:
 * https://github.com/chakra-ui/chakra-ui/blob/main/packages/layout/src/kbd.tsx
 */

import { createHopeComponent, hope } from "@hope-ui/styles";
import { clsx } from "clsx";
import { splitProps } from "solid-js";

import { KbdStyleConfigProps, useStyleConfig } from "./kbd.styles";

export interface KbdProps extends KbdStyleConfigProps {}

/**
 * `Kbd` is a semantic component used to render keyboard shortcut.
 */
export const Kbd = createHopeComponent<"kbd", KbdProps>(props => {
  const [local, styleConfigProps, others] = splitProps(
    props,
    ["class"],
    ["styleConfigOverrides", "unstyled"]
  );

  const { classes, styleOverrides } = useStyleConfig("Kbd", styleConfigProps);

  return (
    <hope.kbd class={clsx(classes().root, local.class)} __css={styleOverrides().root} {...others} />
  );
});
