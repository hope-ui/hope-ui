import "./playground.css";

import { createSignal } from "solid-js";
import { render } from "solid-js/web";

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HopeProvider,
  HopeThemeConfig,
  HStack,
  Radio,
  RadioControl,
  RadioGroup,
  RadioLabel,
  Checkbox,
  CheckboxControl,
  CheckboxLabel,
  useColorMode,
  VStack,
} from ".";

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
        <Checkbox colorScheme="info">
          <CheckboxLabel>Foo</CheckboxLabel>
          <CheckboxControl />
        </Checkbox>
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
