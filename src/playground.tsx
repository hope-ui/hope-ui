import "./playground.css";

import { createSignal, For } from "solid-js";
import { render } from "solid-js/web";

import { Box, Divider, HopeProvider, HopeThemeConfig, HStack, Select, useColorMode, VStack } from ".";

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
  const [selected, setSelected] = createSignal<string | null>("Cherry");
  const [selectedObject, setSelectedObject] = createSignal<Fruit>({ identifier: 5, name: "Cherry", disabled: false });

  return (
    <Box p="$4">
      <HStack spacing="$5">
        <VStack spacing="$5" flexGrow={1}>
          <p>Controlled</p>
          <Select value={selected()} onChange={setSelected} disabled={false}>
            <Select.Trigger maxW="300px">
              <Select.Placeholder>Choose a fruit</Select.Placeholder>
              <Select.Value>{selected()?.toUpperCase()}</Select.Value>
              <Select.Icon />
            </Select.Trigger>
            <Select.Panel>
              <Box px="$4" py="$2">
                Header
              </Box>
              <Divider />
              <Select.Listbox>
                <For each={fruits}>
                  {fruit => (
                    <Select.Option value={fruit} disabled={fruit === "Durian"}>
                      <Select.OptionText>{fruit}</Select.OptionText>
                      <Select.OptionIndicator />
                    </Select.Option>
                  )}
                </For>
              </Select.Listbox>
              <Divider />
              <Box px="$4" py="$2">
                Footer
              </Box>
            </Select.Panel>
          </Select>
          <Select
            value={selectedObject()}
            onChange={setSelectedObject}
            disabled={false}
            optionId="identifier"
            optionLabel="name"
          >
            <Select.Trigger maxW="300px">
              <Select.Placeholder>Choose a fruit</Select.Placeholder>
              <Select.Value>
                {selectedObject()?.identifier} - {selectedObject()?.name}
              </Select.Value>
              <Select.Icon />
            </Select.Trigger>
            <Select.Panel>
              <Select.Listbox>
                <For each={fruitsObject}>
                  {fruit => (
                    <Select.Option value={fruit} disabled={fruit.disabled}>
                      <Select.OptionText>{fruit.name}</Select.OptionText>
                      <Select.OptionIndicator />
                    </Select.Option>
                  )}
                </For>
              </Select.Listbox>
            </Select.Panel>
          </Select>
        </VStack>
        <VStack spacing="$5" flexGrow={1}>
          <p>Uncontrolled</p>
          <Select disabled={false}>
            <Select.Trigger maxW="300px">
              <Select.Placeholder>Choose a fruit</Select.Placeholder>
              <Select.Value />
              <Select.Icon />
            </Select.Trigger>
            <Select.Panel>
              <Select.Listbox>
                <For each={fruits}>
                  {fruit => (
                    <Select.Option value={fruit} disabled={fruit === "Durian"}>
                      <Select.OptionText>{fruit}</Select.OptionText>
                      <Select.OptionIndicator />
                    </Select.Option>
                  )}
                </For>
              </Select.Listbox>
            </Select.Panel>
          </Select>
          <Select
            defaultValue={{ identifier: 5, name: "Cherry", disabled: false }}
            disabled={false}
            optionId="identifier"
            optionLabel="name"
          >
            <Select.Trigger maxW="300px">
              <Select.Placeholder>Choose a fruit</Select.Placeholder>
              <Select.Value />
              <Select.Icon />
            </Select.Trigger>
            <Select.Panel>
              <Select.Listbox>
                <For each={fruitsObject}>
                  {fruit => (
                    <Select.Option value={fruit} disabled={fruit.disabled}>
                      <Select.OptionText>{fruit.name}</Select.OptionText>
                      <Select.OptionIndicator />
                    </Select.Option>
                  )}
                </For>
              </Select.Listbox>
            </Select.Panel>
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
