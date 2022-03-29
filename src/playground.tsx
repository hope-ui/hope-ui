import "./playground.css";

import { createSignal } from "solid-js";
import { render } from "solid-js/web";

import { Box, Button, Collapse, HopeProvider, HopeThemeConfig, HStack, useColorMode, VStack } from ".";

export function App() {
  const { toggleColorMode } = useColorMode();

  const [isExpanded, setIsExpanded] = createSignal(false);

  return (
    <Box p="$4">
      <HStack spacing="$4" mb="$4">
        <Button variant="subtle" colorScheme="neutral" onClick={toggleColorMode}>
          Toggle color mode
        </Button>
        <Button onClick={() => setIsExpanded(prev => !prev)}>Toggle isExpanded</Button>
      </HStack>
      <VStack spacing="$4" alignItems="flex-start">
        <Collapse expanded={isExpanded()}>
          <Box p="40px" color="white" bg="$primary9" rounded="$md" shadow="$md">
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate, debitis id ea, consectetur, culpa
              doloremque optio nostrum aut nulla nam voluptas aliquam aspernatur placeat distinctio quasi tenetur ipsa
              maiores accusantium?
            </p>
          </Box>
        </Collapse>
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
