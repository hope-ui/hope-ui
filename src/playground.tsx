import "./playground.css";

import { createSignal, JSX } from "solid-js";
import { render } from "solid-js/web";

import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  FormLabel,
  HopeProvider,
  HopeThemeConfig,
  HStack,
  IconButton,
  Checkbox,
  CheckboxGroup,
  SimpleOption,
  SimpleSelect,
  useColorMode,
  VStack,
  RadioGroup,
  Radio,
  FormHelperText,
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
        <FormControl as="fieldset" required disabled invalid readOnly>
          <FormLabel as="legend">Favorite Naruto Character</FormLabel>
          <RadioGroup defaultValue="Itachi">
            <HStack spacing="24px">
              <Radio value="Sasuke">Sasuke</Radio>
              <Radio value="Nagato">Nagato</Radio>
              <Radio value="Itachi">Itachi</Radio>
              <Radio value="Sage of the six Paths">Sage of the six Paths</Radio>
            </HStack>
          </RadioGroup>
          <FormHelperText>Select only if you're a fan.</FormHelperText>
        </FormControl>
        <FormControl as="fieldset" required disabled invalid readOnly>
          <FormLabel as="legend">Favorite Naruto Character</FormLabel>
          <CheckboxGroup defaultValue={["Itachi"]}>
            <HStack spacing="24px">
              <Checkbox value="Sasuke">Sasuke</Checkbox>
              <Checkbox value="Nagato">Nagato</Checkbox>
              <Checkbox value="Itachi">Itachi</Checkbox>
              <Checkbox value="Sage of the six Paths">Sage of the six Paths</Checkbox>
            </HStack>
          </CheckboxGroup>
          <FormHelperText>Select only if you're a fan.</FormHelperText>
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
