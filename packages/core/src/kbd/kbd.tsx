/*!
 * Original code by Chakra UI
 * MIT Licensed, Copyright (c) 2019 Segun Adebayo.
 *
 * Credits to the Chakra UI team:
 * https://github.com/chakra-ui/chakra-ui/blob/main/packages/layout/src/kbd.tsx
 */

import { createHopeComponent, createStyleConfig, hope, StyleConfigProps } from "@hope-ui/styles";
import { clsx } from "clsx";
import { splitProps } from "solid-js";

const useStyleConfig = createStyleConfig<"root", {}>({
  root: {
    base: {
      borderRadius: "md",
      borderStyle: "solid",
      borderWidth: "1px",
      borderBottomWidth: "3px",

      px: "0.4em",

      color: "text.primary",
      fontFamily: "mono",
      fontSize: "0.8em",
      fontWeight: "bold",
      lineHeight: "normal",
      whiteSpace: "nowrap",

      borderColor: "neutral.300",
      backgroundColor: "neutral.100",

      _dark: {
        borderColor: "neutral.600",
        backgroundColor: "neutral.800",
      },
    },
  },
});

export type KbdProps = StyleConfigProps<typeof useStyleConfig>;

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
