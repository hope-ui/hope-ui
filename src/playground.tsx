import "./playground.css";

import { createEffect, createSignal, For, onMount } from "solid-js";
import { render } from "solid-js/web";

import { Box, HopeProvider, HopeThemeConfig, Select, SelectButton, SelectOption, SelectOptions, useColorMode } from ".";

const fruits = [
  "Choose a Fruit",
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
  const [selected, setSelected] = createSignal(fruits[0]);

  return (
    <Box p="$4" h={2000}>
      <Select value={selected()} onChange={setSelected} disabled={false}>
        <SelectButton mt={1000} maxW="200px">
          {/* {({ opened, disabled }) => selected()} */}
          {selected()}
        </SelectButton>
        <SelectOptions>
          <For each={fruits}>
            {fruit => (
              <SelectOption value={fruit} disabled={fruit === "Durian"}>
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
