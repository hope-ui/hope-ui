import "./playground.css";

import { createSignal, For } from "solid-js";
import { render } from "solid-js/web";

import { Box, Button, Divider, HopeProvider, HopeThemeConfig, HStack, Select, useColorMode, VStack } from ".";

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
        <Button onClick={toggleColorMode}>Toggle color mode</Button>
        <VStack spacing="$5" flexGrow={1}>
          <p>Controlled</p>
          <Select value={selected()} onChange={setSelected}>
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
          <Select value={selectedObject()} onChange={setSelectedObject} compareKey="identifier" labelKey="name">
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
          <Select defaultValue="Fig">
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
            compareKey="identifier"
            labelKey="name"
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
        <VStack spacing="$5" flexGrow={1}>
          <p>Group</p>
          <Select>
            <Select.Trigger maxW="300px">
              <Select.Placeholder>Choose a food</Select.Placeholder>
              <Select.Value />
              <Select.Icon />
            </Select.Trigger>
            <Select.Panel>
              <Select.Listbox>
                <Select.OptGroup>
                  <Select.Label>Fruits</Select.Label>
                  <For each={["Apple", "Banana", "Blueberry", "Grapes", "Pineapple"]}>
                    {item => (
                      <Select.Option value={item}>
                        <Select.OptionText>{item}</Select.OptionText>
                        <Select.OptionIndicator />
                      </Select.Option>
                    )}
                  </For>
                </Select.OptGroup>
                <Select.OptGroup>
                  <Select.Label>Vegetables</Select.Label>
                  <For each={["Aubergine", "Broccoli", "Carrot", "Courgette", "Leek"]}>
                    {item => (
                      <Select.Option value={item} disabled={item === "Carrot"}>
                        <Select.OptionText>{item}</Select.OptionText>
                        <Select.OptionIndicator />
                      </Select.Option>
                    )}
                  </For>
                </Select.OptGroup>
                <Select.OptGroup>
                  <Select.Label>Meat</Select.Label>
                  <For each={["Beef", "Chicken", "Lamb", "Pork", "Salmon"]}>
                    {item => (
                      <Select.Option value={item}>
                        <Select.OptionText>{item}</Select.OptionText>
                        <Select.OptionIndicator />
                      </Select.Option>
                    )}
                  </For>
                </Select.OptGroup>
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
