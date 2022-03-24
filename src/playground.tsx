/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable simple-import-sort/imports */

import "./playground.css";

import { createSignal, For, Show } from "solid-js";
import { render } from "solid-js/web";

import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  HopeProvider,
  HopeThemeConfig,
  HStack,
  Radio,
  RadioControl,
  RadioGroup,
  RadioLabel,
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
        <FormControl as="fieldset">
          <FormLabel as="legend">Choose a framework</FormLabel>
          <RadioGroup defaultValue="solid">
            <HStack spacing="$6">
              <Radio value="react">
                <RadioControl />
                <RadioLabel>React</RadioLabel>
              </Radio>
              <Radio value="angular" disabled>
                <RadioControl />
                <RadioLabel>Angular</RadioLabel>
              </Radio>
              <Radio value="vue">
                <RadioControl />
                <RadioLabel>Vue</RadioLabel>
              </Radio>
              <Radio value="svelte">
                <RadioControl />
                <RadioLabel>Svelte</RadioLabel>
              </Radio>
              <Radio value="solid">
                <RadioControl />
                <RadioLabel>Solid</RadioLabel>
              </Radio>
            </HStack>
          </RadioGroup>
          <FormHelperText>You should choose Solid.</FormHelperText>
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
