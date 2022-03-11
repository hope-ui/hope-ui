import "./playground.css";

import { render } from "solid-js/web";

import { Box, HopeProvider, HopeThemeConfig, useColorMode } from ".";

export function App() {
  const { toggleColorMode } = useColorMode();

  return <Box p="$4"></Box>;
}

const config: HopeThemeConfig = {
  components: {},
};

render(
  () => (
    <HopeProvider config={config}>
      <App />
    </HopeProvider>
  ),
  document.getElementById("root") as HTMLElement
);
