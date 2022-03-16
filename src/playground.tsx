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
  SelectListbox,
  SelectOption,
  SelectTrigger,
  useColorMode,
} from ".";
import { SelectOptGroup } from "./components";

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
            <For each={["React", "Angular", "Vue", "Svelte", "Solid"]}>
              {item => <SelectOption value={item}>{item}</SelectOption>}
            </For>
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
