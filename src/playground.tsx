import "./playground.css";

import { render } from "solid-js/web";

import { Box, Button, HopeProvider, HopeThemeConfig, HStack, Skeleton, useColorMode, VStack } from ".";

export function App() {
  const { toggleColorMode } = useColorMode();

  return (
    <Box p="$4">
      <HStack spacing="$4" mb="$4">
        <Button variant="subtle" colorScheme="neutral" onClick={toggleColorMode}>
          Toggle color mode
        </Button>
      </HStack>
      <VStack spacing="$4" alignItems="stretch">
        <Skeleton height="20px" />
        <Skeleton height="20px" startColor="$accent2" endColor="$accent8" />
        <Skeleton height="20px" startColor="tomato" endColor="dodgerblue" />
        <Skeleton height="20px" loaded fadeDuration="3s">
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quae, consequatur!</p>
        </Skeleton>
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
