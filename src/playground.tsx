import "./playground.css";

import { createSignal, For, Show } from "solid-js";
import { render } from "solid-js/web";

import {
  Box,
  HopeProvider,
  HopeThemeConfig,
  HStack,
  Select,
  SelectContent,
  SelectIcon,
  SelectOption,
  SelectOptionIndicator,
  SelectOptionText,
  SelectPlaceholder,
  SelectTrigger,
  SelectValue,
  useColorMode,
  VStack,
  IconButton,
  IconCloseSmall,
  IconClose,
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
  const [selected, setSelected] = createSignal<string | null>("Cherry");
  const [selectedObject, setSelectedObject] = createSignal<Fruit>({ identifier: 5, name: "Cherry", disabled: false });

  return (
    <Box p="$4">
      <HStack spacing="$5">
        <VStack spacing="$5" flexGrow={1}>
          <p>Controlled</p>
          <Select value={selected()} onChange={setSelected} disabled={false}>
            <SelectTrigger maxW="300px">
              <SelectPlaceholder>Choose a fruit</SelectPlaceholder>
              <SelectValue>{selected()?.toUpperCase()}</SelectValue>
              <SelectIcon />
            </SelectTrigger>
            <SelectContent>
              <For each={fruits}>
                {fruit => (
                  <SelectOption value={fruit} disabled={fruit === "Durian"}>
                    <SelectOptionText>{fruit}</SelectOptionText>
                    <SelectOptionIndicator />
                  </SelectOption>
                )}
              </For>
            </SelectContent>
          </Select>
          <Select
            value={selectedObject()}
            onChange={setSelectedObject}
            disabled={false}
            optionId="identifier"
            optionLabel="name"
          >
            <SelectTrigger maxW="300px">
              <SelectPlaceholder>Choose a fruit</SelectPlaceholder>
              <SelectValue>
                {selectedObject()?.identifier} - {selectedObject()?.name}
              </SelectValue>
              <SelectIcon />
            </SelectTrigger>
            <SelectContent>
              <For each={fruitsObject}>
                {fruit => (
                  <SelectOption value={fruit} disabled={fruit.disabled}>
                    <SelectOptionText>{fruit.name}</SelectOptionText>
                    <SelectOptionIndicator />
                  </SelectOption>
                )}
              </For>
            </SelectContent>
          </Select>
        </VStack>
        <VStack spacing="$5" flexGrow={1}>
          <p>Uncontrolled</p>
          <Select disabled={false}>
            <SelectTrigger maxW="300px">
              <SelectPlaceholder>Choose a fruit</SelectPlaceholder>
              <SelectValue />
              <SelectIcon />
            </SelectTrigger>
            <SelectContent>
              <For each={fruits}>
                {fruit => (
                  <SelectOption value={fruit} disabled={fruit === "Durian"}>
                    <SelectOptionText>{fruit}</SelectOptionText>
                    <SelectOptionIndicator />
                  </SelectOption>
                )}
              </For>
            </SelectContent>
          </Select>
          <Select
            defaultValue={{ identifier: 5, name: "Cherry", disabled: false }}
            disabled={false}
            optionId="identifier"
            optionLabel="name"
          >
            <SelectTrigger maxW="300px">
              <SelectPlaceholder>Choose a fruit</SelectPlaceholder>
              <SelectValue />
              <SelectIcon />
            </SelectTrigger>
            <SelectContent>
              <For each={fruitsObject}>
                {fruit => (
                  <SelectOption value={fruit} disabled={fruit.disabled}>
                    <SelectOptionText>{fruit.name}</SelectOptionText>
                    <SelectOptionIndicator />
                  </SelectOption>
                )}
              </For>
            </SelectContent>
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
