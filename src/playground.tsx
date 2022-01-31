import "./playground.css";

import { render } from "solid-js/web";

import { Box, extendTheme, HopeProvider, useColorMode } from ".";

const customTheme = extendTheme({
  initialColorMode: "system",
});

export function App() {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Box as="button" onClick={toggleColorMode} bg="danger1">
      {colorMode()}
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
