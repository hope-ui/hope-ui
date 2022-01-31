import { addons } from "@storybook/addons";
import { JSX, onCleanup, onMount } from "solid-js";

import { useColorMode } from "@/color-mode/ColorModeProvider";
import { HopeProvider } from "@/theme/HopeProvider";

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

  // eslint-disable-next-line solid/reactivity
  return props.children;
}

export function HopeWrapper(props: { children?: JSX.Element }) {
  return (
    <HopeProvider>
      <ColorModeWrapper>{props.children}</ColorModeWrapper>
    </HopeProvider>
  );
}
