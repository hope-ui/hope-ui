import "./playground.css";

import { createSignal } from "solid-js";
import { render } from "solid-js/web";

import {
  Box,
  Button,
  ButtonGroup,
  HopeProvider,
  HopeThemeConfig,
  HStack,
  IconButton,
  SimpleOption,
  SimpleSelect,
  useColorMode,
  VStack,
} from ".";
import { IconCheck } from "./components/icons/IconCheck";

export function App() {
  const { toggleColorMode } = useColorMode();

  return (
    <Box p="$4">
      <HStack spacing="$4" mb="$4">
        <Button variant="subtle" colorScheme="neutral" onClick={toggleColorMode}>
          Toggle color mode
        </Button>
      </HStack>
      <VStack spacing="$4" alignItems="flex-start">
        <SimpleSelect placeholder="Choose wisely" maxW={300}>
          <SimpleOption value="react">React</SimpleOption>
          <SimpleOption value="angular">Angular</SimpleOption>
          <SimpleOption value="vue">Vue</SimpleOption>
          <SimpleOption value="svelte">Svelte</SimpleOption>
          <SimpleOption value="solid">Solid</SimpleOption>
        </SimpleSelect>
        <SimpleSelect multiple placeholder="Choose wisely" maxW={300}>
          <SimpleOption value="react">React</SimpleOption>
          <SimpleOption value="angular">Angular</SimpleOption>
          <SimpleOption value="vue">Vue</SimpleOption>
          <SimpleOption value="svelte">Svelte</SimpleOption>
          <SimpleOption value="solid">Solid</SimpleOption>
        </SimpleSelect>
      </VStack>
    </Box>
  );
}

const config: HopeThemeConfig = {};

render(
  () => (
    <HopeProvider config={config}>
      <App />
    </HopeProvider>
  ),
  document.getElementById("root") as HTMLElement
);
