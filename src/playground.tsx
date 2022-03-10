import "./playground.css";

import { createSignal, For } from "solid-js";
import { render } from "solid-js/web";

import {
  Alert,
  Box,
  Button,
  Tooltip,
  CloseButton,
  createDisclosure,
  Divider,
  Drawer,
  HopeProvider,
  HopeThemeConfig,
  HStack,
  Select,
  useColorMode,
  VStack,
} from ".";
import { IconCloseSmall } from "./components/icons/IconCloseSmall";

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

  const { isOpen, onOpen, onClose } = createDisclosure();

  return (
    <Box p="$4">
      <Box p="$4">
        <Tooltip label="Hey, I'm here!" aria-label="A tooltip">
          <span>Hover me</span>
        </Tooltip>
      </Box>
      <Button onClick={onOpen}>Open Drawer</Button>
      <Drawer placement="right" onClose={onClose} opened={isOpen()}>
        <Drawer.Overlay />
        <Drawer.Panel>
          <Drawer.Header borderBottomWidth="1px">Basic Drawer</Drawer.Header>
          <Drawer.Body>
            <p>Some contents...</p>
            <p>Some contents...</p>
            <p>Some contents...</p>
          </Drawer.Body>
        </Drawer.Panel>
      </Drawer>
      <Alert status="danger">
        <Alert.Icon />
        <Alert.Title mr="$2">Your browser is outdated!</Alert.Title>
        <Alert.Description>Your Chakra experience may be degraded.</Alert.Description>
        <CloseButton position="absolute" right="8px" top="8px" />
      </Alert>
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
          <Select value={selected()} onChange={setSelected}>
            <Select.Trigger maxW="300px">
              <Select.Placeholder>Choose a fruit</Select.Placeholder>
              <Select.Value />
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
          <Select value={selectedObject()} onChange={setSelectedObject} compareKey="identifier">
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
                    <Select.Option value={fruit} textValue={fruit.name} disabled={fruit.disabled}>
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
          <Select defaultValue="Fig" defaultTextValue="Fig">
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
          <Select defaultValue="luffy" defaultTextValue="Monkey D. Luffy">
            <Select.Trigger maxW="300px">
              <Select.Placeholder>Choose a framework</Select.Placeholder>
              <Select.Value />
              <Select.Icon />
            </Select.Trigger>
            <Select.Panel>
              <Select.Listbox>
                <Select.Option value="luffy">
                  <Select.OptionText>Monkey D. Luffy</Select.OptionText>
                  <Select.OptionIndicator />
                </Select.Option>
                <Select.Option value="zoro">
                  <Select.OptionText>Roronoa Zoro</Select.OptionText>
                  <Select.OptionIndicator />
                </Select.Option>
              </Select.Listbox>
            </Select.Panel>
          </Select>
          <Select
            defaultValue={{ identifier: 5, name: "Cherry", disabled: false }}
            defaultTextValue="Cherry"
            compareKey="identifier"
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
                    <Select.Option value={fruit} textValue={fruit.name} disabled={fruit.disabled}>
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
