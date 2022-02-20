import "./playground.css";

import { render } from "solid-js/web";

import { Tooltip } from "@/components/tooltip/tooltip";

import { Box, Button, HopeProvider, useColorMode, VStack } from ".";
import { createSignal, Show } from "solid-js";

export function App() {
  const { toggleColorMode } = useColorMode();

  return (
    <Box p="$4">
      <VStack alignItems="start" spacing="$4">
        <Button onClick={toggleColorMode}>Toggle color mode</Button>
        <Tooltip label="Hi mom !" placement="top-end">
          <Button>Hover me</Button>
        </Tooltip>
      </VStack>
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
