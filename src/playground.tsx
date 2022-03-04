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

interface Fruit {
  id: number;
  name: string;
}

const fruitsObject: Fruit[] = [
  { id: 1, name: "Apple" },
  { id: 2, name: "Banana" },
  { id: 3, name: "Blueberry" },
  { id: 4, name: "Boysenberry" },
  { id: 5, name: "Cherry" },
  { id: 6, name: "Cranberry" },
  { id: 7, name: "Durian" },
  { id: 8, name: "Eggplant" },
  { id: 9, name: "Fig" },
  { id: 10, name: "Grape" },
  { id: 11, name: "Guava" },
  { id: 12, name: "Huckleberry" },
];

export function App() {
  const { toggleColorMode } = useColorMode();
  const [selected, setSelected] = createSignal<string>("Durian");
  const [selectedObject, setSelectedObject] = createSignal<Fruit>({ id: 7, name: "Durian" });

  const compareFn = (a: Fruit, b: Fruit) => {
    return a.id === b.id;
  };

  return (
    <Box p="$4">
      <Select value={selected()} onChange={setSelected} disabled={false} placeholder="Choose a fruit">
        <SelectButton maxW="300px">
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
      <Select
        value={selectedObject()}
        onChange={setSelectedObject}
        disabled={false}
        placeholder="Choose a fruit"
        compareFn={compareFn}
      >
        <SelectButton maxW="300px">{selectedObject()?.name}</SelectButton>
        <SelectOptions>
          <For each={fruitsObject}>
            {fruit => (
              <SelectOption value={fruit} disabled={false}>
                {fruit.name}
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
