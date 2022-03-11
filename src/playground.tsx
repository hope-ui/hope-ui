import "./playground.css";

import { render } from "solid-js/web";

import { Badge, Box, HopeProvider, HopeThemeConfig, Tag, useColorMode } from ".";

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
