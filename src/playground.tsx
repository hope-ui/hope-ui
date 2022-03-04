import "./playground.css";

import { createEffect, createSignal, For, onMount } from "solid-js";
import { render } from "solid-js/web";

import { Box, HopeProvider, HopeThemeConfig, Select, SelectButton, SelectOption, SelectOptions, useColorMode } from ".";
import { Button, HStack, VStack } from "./components";

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
  disabled: boolean;
}

const fruitsObject: Fruit[] = [
  { id: 1, name: "Apple", disabled: true },
  { id: 2, name: "Banana", disabled: true },
  { id: 3, name: "Blueberry", disabled: false },
  { id: 4, name: "Boysenberry", disabled: false },
  { id: 5, name: "Cherry", disabled: false },
  { id: 6, name: "Cranberry", disabled: false },
  { id: 7, name: "Durian", disabled: true },
  { id: 8, name: "Eggplant", disabled: true },
  { id: 9, name: "Fig", disabled: false },
  { id: 10, name: "Grape", disabled: false },
  { id: 11, name: "Guava", disabled: true },
  { id: 12, name: "Huckleberry", disabled: true },
];

export function App() {
  const { toggleColorMode } = useColorMode();
  const [selected, setSelected] = createSignal<string>("Cherry");
  const [selectedObject, setSelectedObject] = createSignal<Fruit>({ id: 5, name: "Cherry", disabled: false });

  const compareFn = (a: Fruit, b: Fruit) => {
    return a.id === b.id;
  };

  return (
    <Box p="$4">
      <HStack spacing="$5">
        <VStack spacing="$5" flexGrow={1}>
          <p>Controlled</p>
          <Select value={selected()} onChange={setSelected} disabled={false} placeholder="Choose a fruit">
            <SelectButton maxW="300px">
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
          <Select
            value={selectedObject()}
            onChange={setSelectedObject}
            disabled={false}
            placeholder="Choose a fruit"
            compareFn={compareFn}
          >
            <SelectButton maxW="300px">
              {selectedObject()?.id} - {selectedObject()?.name}
            </SelectButton>
            <SelectOptions>
              <For each={fruitsObject}>
                {fruit => (
                  <SelectOption value={fruit} disabled={fruit.disabled}>
                    {fruit.name}
                  </SelectOption>
                )}
              </For>
            </SelectOptions>
          </Select>
        </VStack>
        <VStack spacing="$5" flexGrow={1}>
          <p>Uncontrolled</p>
          <Select defaultValue="Cherry" disabled={false} placeholder="Choose a fruit">
            <SelectButton maxW="300px">Hello</SelectButton>
            <SelectOptions>
              <For each={fruits}>
                {fruit => (
                  <SelectOption value={fruit} disabled={fruit === "Durian"}>
                    {fruit}
                  </SelectOption>
                )}
              </For>
            </SelectOptions>
          </Select>
          <Select
            defaultValue={{ id: 5, name: "Cherry", disabled: false }}
            disabled={false}
            placeholder="Choose a fruit"
            compareFn={compareFn}
          >
            <SelectButton maxW="300px">Hello</SelectButton>
            <SelectOptions>
              <For each={fruitsObject}>
                {fruit => (
                  <SelectOption value={fruit} disabled={fruit.disabled}>
                    {fruit.name}
                  </SelectOption>
                )}
              </For>
            </SelectOptions>
          </Select>
        </VStack>
      </HStack>
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
