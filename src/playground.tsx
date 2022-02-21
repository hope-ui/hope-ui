import "./playground.css";

import { createSignal } from "solid-js";
import { render } from "solid-js/web";

import { Tooltip } from "@/components/tooltip/tooltip";

import { Box, Button, HopeProvider, Text, useColorMode, VStack } from ".";

export function App() {
  const [isOpen, setIsOpen] = createSignal(false);
  const { toggleColorMode } = useColorMode();

  return (
    <Box p="$4">
      <VStack alignItems="start" spacing="$4">
        <Button onClick={toggleColorMode}>Toggle color mode</Button>
        <Button onClick={() => setIsOpen(prev => !prev)}>
          Toggle tooltip: {isOpen().toString()}
        </Button>
        <Tooltip label="HI MOM !" hasArrow arrowSize={10} isOpen={isOpen()} placement="top">
          <Button>Hover me</Button>
        </Tooltip>
        <Tooltip label="HI MOM !" hasArrow arrowSize={20} placement="top">
          <Button>Hover me 2</Button>
        </Tooltip>
        <Text>
          Lorem ipsum dolor sit, amet consectetur adipisicing{" "}
          <Tooltip label="the elit" isInline placement="top" hasArrow>
            <strong>elit</strong>
          </Tooltip>
          . Saepe vitae non nulla placeat libero velit consectetur animi quam nesciunt blanditiis!
        </Text>
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
