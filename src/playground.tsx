import "./playground.css";

import { render } from "solid-js/web";

import {
  Box,
  Button,
  HopeProvider,
  HopeThemeConfig,
  HStack,
  Radio,
  RadioGroup,
  RadioIndicator,
  RadioLabel,
  Text,
  useColorMode,
  VStack,
} from ".";
import { FormControl, FormLabel } from "./components";
import { createSignal } from "solid-js";

export function App() {
  const { toggleColorMode } = useColorMode();

  const [disabled, setDisabled] = createSignal(false);

  return (
    <Box p="$4">
      <HStack spacing="$4" mb="$4">
        <Button variant="subtle" colorScheme="neutral" onClick={toggleColorMode}>
          Toggle color mode
        </Button>
        <Button onClick={() => setDisabled(prev => !prev)}>Disable formcontrol</Button>
      </HStack>
      <VStack spacing="$4" alignItems="flex-start">
        <FormControl as="fieldset">
          <FormLabel as="legend">Choose wisely</FormLabel>
          <RadioGroup>
            <HStack spacing="$4">
              <Radio value="react" disabled={disabled()}>
                <RadioIndicator />
                <RadioLabel>React</RadioLabel>
              </Radio>
              <Radio value="angular">
                <RadioIndicator />
                <RadioLabel>Angular</RadioLabel>
              </Radio>
              <Radio value="vue">
                <RadioIndicator />
                <RadioLabel>Vue</RadioLabel>
              </Radio>
            </HStack>
          </RadioGroup>
        </FormControl>
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
