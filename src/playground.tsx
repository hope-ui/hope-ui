import "./playground.css";

import { createSignal } from "solid-js";
import { render } from "solid-js/web";

import {
  Box,
  Button,
  CircularProgress,
  CircularProgressIndicator,
  CircularProgressLabel,
  HopeProvider,
  HopeThemeConfig,
  HStack,
  useColorMode,
  VStack,
} from ".";
import { Progress, ProgressIndicator, ProgressLabel } from "./components";

export function App() {
  const { toggleColorMode } = useColorMode();

  const [valZ, setValZ] = createSignal(50);

  return (
    <Box p="$4">
      <HStack spacing="$4" mb="$4">
        <Button variant="subtle" colorScheme="neutral" onClick={toggleColorMode}>
          Toggle color mode
        </Button>
        <Button onClick={() => setValZ(prev => prev + 5)}>Inc Z</Button>
        <Button onClick={() => setValZ(0)}>Reset Z</Button>
      </HStack>
      <VStack spacing="$4" alignItems="flex-start">
        <Progress w="400px" value={valZ()} trackColor="$success4" aria-label="foo">
          <ProgressIndicator color="$success9" />
          <ProgressLabel />
        </Progress>
        <CircularProgress value={valZ()} trackColor="$success4" aria-label="foo">
          <CircularProgressIndicator color="$success9" />
          <CircularProgressLabel />
        </CircularProgress>
        <CircularProgress value={valZ()} size={64} thickness={8} indeterminate>
          <CircularProgressIndicator withRoundCaps />
          <CircularProgressLabel />
        </CircularProgress>
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
