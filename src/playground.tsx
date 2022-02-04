import "./playground.css";

import { render } from "solid-js/web";

import {
  Box,
  Center,
  HopeComponentProps,
  HopeProvider,
  HStack,
  Stack,
  Tag,
  TagCloseButton,
  Text,
  useColorMode,
  useColorModeValue,
} from ".";
import { createSignal } from "solid-js";

export function App() {
  const { toggleColorMode } = useColorMode();
  const [radius, setRadius] = createSignal("$md");
  return (
    <div>
      <Tag
        onClick={() => setRadius(radius() === "$none" ? "$lg" : "$none")}
        borderRadius={radius()}
        size="lg"
        variant="solid"
        colorScheme="primary"
        rightSection={<TagCloseButton aria-label="Close" />}
      >
        Tag
      </Tag>
    </div>
  );
}

render(
  () => (
    <HopeProvider>
      <App />
    </HopeProvider>
  ),
  document.getElementById("root") as HTMLElement
);
