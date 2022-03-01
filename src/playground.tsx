import "./playground.css";

import { createSignal } from "solid-js";
import { render } from "solid-js/web";

import { AspectRatio, Box, Divider, hope, HopeProvider, HStack, SimpleGrid, Stack, useColorMode, VStack } from ".";

export function App() {
  const { toggleColorMode } = useColorMode();

  return <Box p="$4"></Box>;
}

render(
  () => (
    <HopeProvider>
      <App />
    </HopeProvider>
  ),
  document.getElementById("root") as HTMLElement
);
