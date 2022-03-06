/* eslint-disable solid/reactivity */
import { addons } from "@storybook/addons";
import { JSX, onCleanup, onMount } from "solid-js";

import { useColorMode } from "@/theme/color-mode";
import { HopeProvider } from "@/theme/provider";

const channel = addons.getChannel();

/**
 * Utility component to sync Hope UI color mode with storybook-color-mode addon.
 */
function ColorModeWrapper(props: { children?: JSX.Element }) {
  const { setColorMode } = useColorMode();

  const listener = (isDark: boolean) => setColorMode(isDark ? "dark" : "light");

  onMount(() => {
    channel.on("DARK_MODE", listener);
  });

  onCleanup(() => {
    channel.off("DARK_MODE", listener);
  });

  return props.children;
}

export function HopeWrapper(props: { children?: JSX.Element }) {
  return (
    <HopeProvider>
      <ColorModeWrapper>{props.children}</ColorModeWrapper>
    </HopeProvider>
  );
}
