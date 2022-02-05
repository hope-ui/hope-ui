import "./playground.css";

import { render } from "solid-js/web";

import { Box, extendTheme, HopeProvider, Icon, IconCheckCircle, useColorMode, useTheme } from ".";

export function App() {
  return (
    <Box>
      <Icon boxSize={64} />
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
