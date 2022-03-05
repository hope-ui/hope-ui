import "./playground.css";

import { createEffect, createSignal, For, onMount } from "solid-js";
import { render } from "solid-js/web";

import {
  Box,
  hope,
  HopeProvider,
  HopeThemeConfig,
  Select,
  SelectButton,
  SelectButtonRenderPropParams,
  SelectOption,
  SelectOptions,
  Button,
  HStack,
  VStack,
  useColorMode,
} from ".";

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
  identifier: number;
  name: string;
  disabled: boolean;
}

const fruitsObject: Fruit[] = [
  { identifier: 1, name: "Apple", disabled: true },
  { identifier: 2, name: "Banana", disabled: false },
  { identifier: 3, name: "Blueberry", disabled: true },
  { identifier: 4, name: "Boysenberry", disabled: false },
  { identifier: 5, name: "Cherry", disabled: false },
  { identifier: 6, name: "Cranberry", disabled: false },
  { identifier: 7, name: "Durian", disabled: true },
  { identifier: 8, name: "Eggplant", disabled: true },
  { identifier: 9, name: "Fig", disabled: false },
  { identifier: 10, name: "Grape", disabled: false },
  { identifier: 11, name: "Guava", disabled: false },
  { identifier: 12, name: "Huckleberry", disabled: true },
];

export function App() {
  const { toggleColorMode } = useColorMode();
  const [selected, setSelected] = createSignal<string>("Cherry");
  const [selectedObject, setSelectedObject] = createSignal<Fruit>({ identifier: 5, name: "Cherry", disabled: false });

  return (
    <Box p="$4">
      <HStack spacing="$5">
        <VStack spacing="$5" flexGrow={1}>
          <p>Controlled</p>
          <Select value={selected()} onChange={setSelected} disabled={false} placeholder="Choose a fruit">
            <SelectButton maxW="300px">{selected()}</SelectButton>
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
            value={selectedObject()}
            onChange={setSelectedObject}
            disabled={false}
            placeholder="Choose a fruit"
            optionId="identifier"
            optionLabel="name"
          >
            <SelectButton maxW="300px">
              {/* {({ value, opened, disabled }) => selected()} */}
              {selectedObject()?.identifier} - {selectedObject()?.name}
            </SelectButton>
            <SelectOptions>
              <For each={fruitsObject}>
                {fruit => (
                  <SelectOption
                    value={fruit}
                    disabled={fruit.disabled}
                    d="flex"
                    flexDirection="column"
                    alignItems="flex-start"
                  >
                    {({ active, selected, disabled }) => (
                      <>
                        <hope.span fontWeight="$medium">
                          {fruit.identifier} - {fruit.name}
                        </hope.span>
                        <hope.span
                          fontSize="$sm"
                          color={
                            disabled ? "$neutral8" : selected ? "$whiteAlpha11" : active ? "$primary11" : "$neutral11"
                          }
                        >
                          Lorem ipsum dolor sit.
                        </hope.span>
                      </>
                    )}
                  </SelectOption>
                )}
              </For>
            </SelectOptions>
          </Select>
        </VStack>
        <VStack spacing="$5" flexGrow={1}>
          <p>Uncontrolled</p>
          <Select defaultValue="Cherry" disabled={false} placeholder="Choose a fruit">
            <SelectButton maxW="300px">
              {({ value, opened, disabled }: SelectButtonRenderPropParams<string>) => value}
            </SelectButton>
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
            defaultValue={{ identifier: 5, name: "Cherry", disabled: false }}
            disabled={false}
            placeholder="Choose a fruit"
            optionId="identifier"
            optionLabel="name"
          >
            <SelectButton maxW="300px">
              {({ value, opened, disabled }: SelectButtonRenderPropParams<Fruit>) =>
                `${value?.identifier} - ${value?.name}`
              }
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
