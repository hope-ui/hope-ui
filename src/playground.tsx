import "./playground.css";

import { render } from "solid-js/web";

import { Tooltip } from "@/components/tooltip/old-tooltip";

import { Box, Button, HopeProvider, useColorMode, VStack } from ".";
import { createSignal, Show } from "solid-js";

export function App() {
  const [show, setShow] = createSignal(false);

  const { toggleColorMode } = useColorMode();

  return (
    <Box p="$4">
      <VStack alignItems="start" spacing="$4">
        <Button onClick={toggleColorMode}>Toggle color mode</Button>
        <Button onClick={() => setShow(prev => !prev)}>Show tooltip trigger</Button>
        <Show when={show()}>
          <Tooltip>
            <Button>Hover me</Button>
          </Tooltip>
        </Show>
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
