import "./playground.css";

import { createSignal } from "solid-js";
import { render } from "solid-js/web";

import {
  AspectRatio,
  Box,
  Divider,
  Heading,
  hope,
  HopeProvider,
  HStack,
  SimpleGrid,
  Stack,
  useColorMode,
  VStack,
} from ".";

export function App() {
  const { toggleColorMode } = useColorMode();

  return (
    <Box p="$4">
      <VStack>
        <Heading>Heading</Heading>
        <Heading level="1">Heading</Heading>
        <Heading level="2">Heading</Heading>
        <Heading level="3">Heading</Heading>
        <Heading level="4">Heading</Heading>
        <Heading level="5">Heading</Heading>
        <Heading level="6">Heading</Heading>
      </VStack>
      <VStack>
        <Heading>Heading</Heading>
        <Heading level={1}>Heading</Heading>
        <Heading level={2}>Heading</Heading>
        <Heading level={3}>Heading</Heading>
        <Heading level={4}>Heading</Heading>
        <Heading level={5}>Heading</Heading>
        <Heading level={6}>Heading</Heading>
      </VStack>
    </Box>
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
