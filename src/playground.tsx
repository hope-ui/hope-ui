import "./playground.css";

import { createSignal } from "solid-js";
import { render } from "solid-js/web";

import { AspectRatio, Box, hope, HopeProvider, HStack, SimpleGrid, Stack, useColorMode, VStack } from ".";

export function App() {
  const { toggleColorMode } = useColorMode();

  return (
    <Box p="$4">
      <SimpleGrid columns={2} columnGap="40px" rowGap="20px">
        <Box bg="tomato" height="80px"></Box>
        <Box bg="tomato" height="80px"></Box>
        <Box bg="tomato" height="80px"></Box>
        <Box bg="tomato" height="80px"></Box>
        <Box bg="tomato" height="80px"></Box>
      </SimpleGrid>
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
