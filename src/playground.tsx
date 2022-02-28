import "./playground.css";

import { createSignal } from "solid-js";
import { render } from "solid-js/web";

import { Box, HopeProvider, HStack, Stack, useColorMode, VStack } from ".";

export function App() {
  const { toggleColorMode } = useColorMode();

  return (
    <Box p="$4">
      <Stack
        direction={{
          "@initial": "column",
          "@sm": "row",
          "@md": "column-reverse",
          "@lg": "row-reverse",
          "@2xl": "column",
        }}
        spacing={{ "@initial": "10px", "@md": "100px", "@xl": "200px" }}
      >
        <Box w="40px" h="40px" bg="yellow">
          1
        </Box>
        <Box w="40px" h="40px" bg="tomato">
          2
        </Box>
        <Box w="40px" h="40px" bg="pink">
          3
        </Box>
      </Stack>
    </Box>
  );
}

render(
  () => (
    <HopeProvider>
      <App />
    </HopeProvider>
  ),
  document.getElementById("root") as HTMLElement
);
