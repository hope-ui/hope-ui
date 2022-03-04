import "./playground.css";

import { createEffect, createSignal, For, onMount } from "solid-js";
import { render } from "solid-js/web";

import { Box, HopeProvider, HopeThemeConfig, Select, SelectButton, SelectOption, SelectOptions, useColorMode } from ".";
import { Button } from "./components";

const fruits = [
  "Apple",
  "Banana",
  "Blueberry",
  "Boysenberry",
  "Cherry",
  "Cranberry",
  "Durian",
  "Eggplant",
  "Fig",
  "Grape",
  "Guava",
  "Huckleberry",
];

export function App() {
  const { toggleColorMode } = useColorMode();
  const [selected, setSelected] = createSignal<string>();

  return (
    <Box p="$4" h={2000}>
      <Select value={selected()} onChange={setSelected} disabled={false} placeholder="Choose a fruit">
        <SelectButton mt={1000} maxW="200px">
          {/* {({ opened, disabled }) => selected()} */}
          {selected()}
        </SelectButton>
        <SelectOptions>
          <For each={fruits}>
            {fruit => (
              <SelectOption value={fruit} disabled={false}>
                {/* {({ active, selected, disabled }) => <span>{person}</span>} */}
                {fruit}
              </SelectOption>
            )}
          </For>
        </SelectOptions>
      </Select>
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
