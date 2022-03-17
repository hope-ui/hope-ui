import "./playground.css";

import { render } from "solid-js/web";

import {
  hope,
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
import { Heading, VStack } from "./components";
import { createEffect, createSignal, For } from "solid-js";

interface Option {
  id: number;
  label: string;
}

function StringDemo() {
  const [value, setValue] = createSignal<string>("solid");
  const [valueMultiple, setValueMultiple] = createSignal<string[]>(["solid", "react"]);

  createEffect(() => {
    console.log("string value: ", value());
  });

  createEffect(() => {
    console.log("string valueMultiple: ", valueMultiple());
  });

  return (
    <>
      <p>Uncontrolled</p>
      <Select placeholder="Uncontrolled no default">
        <SelectTrigger maxW="300px" />
        <SelectContent>
          <SelectListbox>
            <SelectOption value="react">React</SelectOption>
            <SelectOption value="angular">Angular</SelectOption>
            <SelectOption value="vue">Vue</SelectOption>
            <SelectOption value="svelte">Svelte</SelectOption>
            <SelectOption value="solid">Solid</SelectOption>
          </SelectListbox>
        </SelectContent>
      </Select>
      <Select placeholder="Uncontrolled no default (multiple)" multiple>
        <SelectTrigger maxW="300px" />
        <SelectContent>
          <SelectListbox>
            <SelectOption value="react">React</SelectOption>
            <SelectOption value="angular">Angular</SelectOption>
            <SelectOption value="vue">Vue</SelectOption>
            <SelectOption value="svelte">Svelte</SelectOption>
            <SelectOption value="solid">Solid</SelectOption>
          </SelectListbox>
        </SelectContent>
      </Select>
      <Select placeholder="Uncontrolled default" defaultValue="react">
        <SelectTrigger maxW="300px" />
        <SelectContent>
          <SelectListbox>
            <SelectOption value="react">React</SelectOption>
            <SelectOption value="angular">Angular</SelectOption>
            <SelectOption value="vue">Vue</SelectOption>
            <SelectOption value="svelte">Svelte</SelectOption>
            <SelectOption value="solid">Solid</SelectOption>
          </SelectListbox>
        </SelectContent>
      </Select>
      <Select placeholder="Uncontrolled default (multiple)" multiple defaultValue={["react", "solid"]}>
        <SelectTrigger maxW="300px" />
        <SelectContent>
          <SelectListbox>
            <SelectOption value="react">React</SelectOption>
            <SelectOption value="angular">Angular</SelectOption>
            <SelectOption value="vue">Vue</SelectOption>
            <SelectOption value="svelte">Svelte</SelectOption>
            <SelectOption value="solid">Solid</SelectOption>
          </SelectListbox>
        </SelectContent>
      </Select>
      <p>Controlled</p>
      <Select placeholder="Controlled" value={value()} onChange={setValue}>
        <SelectTrigger maxW="300px" />
        <SelectContent>
          <SelectListbox>
            <SelectOption value="react">React</SelectOption>
            <SelectOption value="angular">Angular</SelectOption>
            <SelectOption value="vue">Vue</SelectOption>
            <SelectOption value="svelte">Svelte</SelectOption>
            <SelectOption value="solid">Solid</SelectOption>
          </SelectListbox>
        </SelectContent>
      </Select>
      <Select placeholder="Controlled (multiple)" multiple value={valueMultiple()} onChange={setValueMultiple}>
        <SelectTrigger maxW="300px" />
        <SelectContent>
          <SelectListbox>
            <SelectOption value="react">React</SelectOption>
            <SelectOption value="angular">Angular</SelectOption>
            <SelectOption value="vue">Vue</SelectOption>
            <SelectOption value="svelte">Svelte</SelectOption>
            <SelectOption value="solid">Solid</SelectOption>
          </SelectListbox>
        </SelectContent>
      </Select>
    </>
  );
}

function ObjectDemo() {
  const options: Option[] = [
    { id: 1, label: "React" },
    { id: 2, label: "Angular" },
    { id: 3, label: "Vue" },
    { id: 4, label: "Svelte" },
    { id: 5, label: "Solid" },
  ];

  const [value, setValue] = createSignal<Option | undefined>({ id: 1, label: "React" });
  const [valueMultiple, setValueMultiple] = createSignal<Option[]>([{ id: 1, label: "React" }]);

  createEffect(() => {
    console.log("object value: ", { ...value() });
  });

  createEffect(() => {
    console.log(
      "object valueMultiple: ",
      valueMultiple().map(item => ({ ...item }))
    );
  });

  return (
    <>
      <p>Uncontrolled</p>
      <Select placeholder="Uncontrolled no default">
        <SelectTrigger maxW="300px" />
        <SelectContent>
          <SelectListbox>
            <For each={options}>{option => <SelectOption value={option}>{option.label}</SelectOption>}</For>
          </SelectListbox>
        </SelectContent>
      </Select>
      <Select placeholder="Uncontrolled no default (multiple)" multiple>
        <SelectTrigger maxW="300px" />
        <SelectContent>
          <SelectListbox>
            <For each={options}>{option => <SelectOption value={option}>{option.label}</SelectOption>}</For>
          </SelectListbox>
        </SelectContent>
      </Select>
      <Select placeholder="Uncontrolled default" defaultValue={{ id: 1, label: "React" }}>
        <SelectTrigger maxW="300px" />
        <SelectContent>
          <SelectListbox>
            <For each={options}>{option => <SelectOption value={option}>{option.label}</SelectOption>}</For>
          </SelectListbox>
        </SelectContent>
      </Select>
      <Select
        placeholder="Uncontrolled default (multiple)"
        multiple
        defaultValue={[
          { id: 1, label: "React" },
          { id: 5, label: "Solid" },
        ]}
      >
        <SelectTrigger maxW="300px" />
        <SelectContent>
          <SelectListbox>
            <For each={options}>{option => <SelectOption value={option}>{option.label}</SelectOption>}</For>
          </SelectListbox>
        </SelectContent>
      </Select>

      <p>Controlled</p>
      <Select placeholder="Controlled" value={value()} onChange={setValue}>
        <SelectTrigger maxW="300px" />
        <SelectContent>
          <SelectListbox>
            <For each={options}>{option => <SelectOption value={option}>{option.label}</SelectOption>}</For>
          </SelectListbox>
        </SelectContent>
      </Select>
      <Select placeholder="Controlled (multiple)" multiple value={valueMultiple()} onChange={setValueMultiple}>
        <SelectTrigger maxW="300px" />
        <SelectContent>
          <SelectListbox>
            <For each={options}>{option => <SelectOption value={option}>{option.label}</SelectOption>}</For>
          </SelectListbox>
        </SelectContent>
      </Select>
    </>
  );
}

export function App() {
  const { toggleColorMode } = useColorMode();

  return (
    <Box p="$4">
      <VStack spacing="$4" alignItems="flex-start">
        <HStack spacing="$4">
          <Button onClick={toggleColorMode}>Toggle color mode</Button>
        </HStack>
        <HStack spacing="$4">
          <VStack spacing="$4">
            <Heading>String</Heading>
            <StringDemo />
          </VStack>
          <VStack spacing="$4">
            <Heading> Object</Heading>
            <ObjectDemo />
          </VStack>
        </HStack>
      </VStack>
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
