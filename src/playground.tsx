import "./playground.css";

import { For } from "solid-js";
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
  Progress,
  ProgressIndicator,
  ProgressLabel,
} from ".";

export function App() {
  const { toggleColorMode } = useColorMode();

  return (
    <Box p="$4">
      <VStack spacing="$4" alignItems="stretch">
        <Select>
          <SelectTrigger maxW="300px">
            <SelectPlaceholder>Choose wisely</SelectPlaceholder>
            <SelectSingleValue />
            <SelectIcon />
          </SelectTrigger>
          <SelectContent>
            <SelectListbox>
              <For each={["React", "Angular", "Vue", "Svelte", "Solid"]}>
                {option => (
                  <SelectOption value={option}>
                    <SelectOptionText>{option}</SelectOptionText>
                    <SelectOptionIndicator />
                  </SelectOption>
                )}
              </For>
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
