import "./playground.css";

import { createSignal, For } from "solid-js";
import { render } from "solid-js/web";

import {
  Box,
  Button,
  HopeProvider,
  HopeThemeConfig,
  HStack,
  Select,
  SelectContent,
  SelectIcon,
  SelectListbox,
  SelectMultiValue,
  SelectOption,
  SelectOptionIndicator,
  SelectOptionText,
  SelectPlaceholder,
  SelectSingleValue,
  SelectTrigger,
  useColorMode,
  VStack,
  Progress,
  CircularProgress,
  CircularProgressIndicator,
  CircularProgressLabel,
  Center,
  ProgressIndicator,
  ProgressLabel,
} from ".";

export function App() {
  const { toggleColorMode } = useColorMode();

  const [valZ, setValZ] = createSignal(30);

  return (
    <Box p="$4">
      <HStack spacing="$4" mb="$4">
        <Button onClick={() => setValZ(prev => prev + 5)}>Inc Z</Button>
        <Button onClick={() => setValZ(0)}>Reset Z</Button>
      </HStack>
      <VStack spacing="$4" alignItems="flex-start">
        <Progress w="400px" value={valZ()} rounded="$full" indeterminate>
          <ProgressIndicator striped animated rounded="$full" />
          <ProgressLabel />
        </Progress>
        <Progress w="400px" value={valZ()} rounded="$full">
          <ProgressIndicator striped animated rounded="$full" />
          <ProgressLabel>Dowloading...{valZ()}% done</ProgressLabel>
        </Progress>
        {/* <CircularProgress value={valZ()} size={64} thickness={8}>
          <CircularProgressIndicator withRoundCaps />
          <CircularProgressLabel />
        </CircularProgress> */}
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
