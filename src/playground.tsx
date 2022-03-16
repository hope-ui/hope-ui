import "./playground.css";

import { render } from "solid-js/web";

import {
  hope,
  Box,
  Button,
  HopeProvider,
  HopeThemeConfig,
  HStack,
  Select,
  SelectContent,
  SelectListbox,
  SelectOption,
  SelectTrigger,
  useColorMode,
} from ".";

export function App() {
  const { toggleColorMode } = useColorMode();

  return (
    <Box p="$4">
      <HStack spacing="$4" mb="$4">
        <Button onClick={toggleColorMode}>Toggle color mode</Button>
      </HStack>
      <Select placeholder="Choose wisely">
        <SelectTrigger maxW="300px" />
        <SelectContent>
          <SelectListbox>
            <SelectOption value="react">React</SelectOption>
            <SelectOption value="angular">Angular</SelectOption>
            <SelectOption value="vue">Vue</SelectOption>
            <SelectOption value="svelte">Svelte</SelectOption>
            <SelectOption value="solid">Solid</SelectOption>
          </SelectListbox>
        </SelectContent>
      </Select>
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
