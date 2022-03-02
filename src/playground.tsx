import "./playground.css";

import { createSignal } from "solid-js";
import { render } from "solid-js/web";

import {
  AspectRatio,
  Box,
  Divider,
  Heading,
  hope,
  HopeProvider,
  HopeThemeConfig,
  HStack,
  SimpleGrid,
  Stack,
  Text,
  useColorMode,
  VStack,
} from ".";

export function App() {
  const { toggleColorMode } = useColorMode();

  return (
    <Box p="$4">
      <VStack>
        <Heading>Heading</Heading>
        <Text>Text</Text>
      </VStack>
    </Box>
  );
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
