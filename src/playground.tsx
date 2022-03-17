import "./playground.css";

import { render } from "solid-js/web";

import {
  Box,
  Button,
  HopeProvider,
  HopeThemeConfig,
  HStack,
  Select,
  SelectContent,
  SelectIcon,
  SelectListbox,
  SelectMultiValue,
  SelectOption,
  SelectOptionIndicator,
  SelectOptionText,
  SelectPlaceholder,
  SelectSingleValue,
  SelectTrigger,
  useColorMode,
  VStack,
} from ".";

export function App() {
  const { toggleColorMode } = useColorMode();

  return (
    <Box p="$4">
      <VStack spacing="$4" alignItems="flex-start">
        <HStack spacing="$4">
          <Button onClick={toggleColorMode}>Toggle color mode</Button>
        </HStack>
        <Select multiple>
          <SelectTrigger w="$full" maxW="300px">
            <SelectPlaceholder>Choose wisely</SelectPlaceholder>
            <SelectMultiValue />
            <SelectIcon />
          </SelectTrigger>
          <SelectContent>
            <SelectListbox>
              <SelectOption value="react">
                <SelectOptionText>React</SelectOptionText>
                <SelectOptionIndicator />
              </SelectOption>
              <SelectOption value="angular">
                <SelectOptionText>Angular</SelectOptionText>
                <SelectOptionIndicator />
              </SelectOption>
              <SelectOption value="vue">
                <SelectOptionText>Vue</SelectOptionText>
                <SelectOptionIndicator />
              </SelectOption>
              <SelectOption value="svelte">
                <SelectOptionText>Svelte</SelectOptionText>
                <SelectOptionIndicator />
              </SelectOption>
              <SelectOption value="solid">
                <SelectOptionText>Solid</SelectOptionText>
                <SelectOptionIndicator />
              </SelectOption>
            </SelectListbox>
          </SelectContent>
        </Select>
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
