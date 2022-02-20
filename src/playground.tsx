import "./playground.css";

import { render } from "solid-js/web";

import { Box, Button, Center, HopeProvider, useColorMode } from ".";

export function App() {
  const { toggleColorMode } = useColorMode();

  return (
    <Box p="$4" boxSize="$full">
      <Center boxSize="$full">
        <Button onClick={toggleColorMode}>Toggle color mode</Button>
      </Center>
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
