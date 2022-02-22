import "./playground.css";

import { render } from "solid-js/web";

import { Box, Button, HopeProvider, useColorMode, VStack } from ".";

export function App() {
  const { toggleColorMode } = useColorMode();

  return (
    <Box p="$4">
      <VStack alignItems="start" spacing="$4">
        <Button onClick={toggleColorMode}>Toggle color mode</Button>
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
