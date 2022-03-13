import "./playground.css";

import { render } from "solid-js/web";

import { Box, Button, HopeProvider, HopeThemeConfig, HStack, Progress, VStack, useColorMode } from ".";
import { progressLabelStyles } from "./components/progress/progress.styles";

export function App() {
  const { toggleColorMode } = useColorMode();

  return (
    <Box p="$4">
      <HStack spacing="$4">
        <Button onClick={toggleColorMode}>Toggle color mode</Button>
      </HStack>
      <VStack alignItems="stretch" spacing="$4">
        <Progress value={80} />
        <Progress striped value={64} />
        <Progress striped animated value={64} />
        <Progress colorScheme="success" size="sm" value={20} />
        <Progress colorScheme="success" size="md" value={20} />
        <Progress colorScheme="success" size="lg" value={20} />
        <Progress colorScheme="success" height="32px" value={20} />
        <Progress value={20} size="xs" colorScheme="primary" />
        <Progress value={20} size="xs" colorScheme="neutral" />
        <Progress value={20} size="xs" colorScheme="success" />
        <Progress value={20} size="xs" colorScheme="info" />
        <Progress value={20} size="xs" colorScheme="warning" />
        <Progress value={20} size="xs" colorScheme="danger" />
        <Progress size="xs" indeterminate />
        <Progress size="xs" value={50}>
          <span class={progressLabelStyles()}>80%</span>
        </Progress>
        <Progress size="sm" value={50}>
          <span class={progressLabelStyles()}>80%</span>
        </Progress>
        <Progress size="md" value={50}>
          <span class={progressLabelStyles()}>80%</span>
        </Progress>
        <Progress size="lg" value={50}>
          <span class={progressLabelStyles()}>80%</span>
        </Progress>
        <Progress h="40px" value={50}>
          <span class={progressLabelStyles()}>80%</span>
        </Progress>
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
