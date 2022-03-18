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
  CircularProgress,
  CircularProgressIndicator,
  CircularProgressLabel,
  Center,
} from ".";

export function App() {
  const { toggleColorMode } = useColorMode();

  const [valZ, setValZ] = createSignal(30);

  const [valA, setValA] = createSignal(30);
  const [valB, setValB] = createSignal(20);
  const [valC, setValC] = createSignal(10);

  return (
    <Box p="$4">
      <HStack spacing="$4">
        <Button onClick={() => setValZ(prev => prev + 5)}>Inc Z</Button>
        <Button onClick={() => setValZ(0)}>Reset Z</Button>
        <Button onClick={() => setValA(prev => prev + 5)}>Inc A</Button>
        <Button onClick={() => setValB(prev => prev + 5)}>Inc B</Button>
        <Button onClick={() => setValC(prev => prev + 5)}>Inc C</Button>
      </HStack>
      <VStack spacing="$4" alignItems="flex-start">
        <CircularProgress size={64} thickness={8} withRoundCaps>
          <CircularProgressIndicator value={valZ()} />
          <CircularProgressLabel>{valZ()}%</CircularProgressLabel>
        </CircularProgress>
      </VStack>
      <CircularProgress size={64} withRoundCaps>
        <CircularProgressIndicator value={valA()} color="#68b5e8" />
        <CircularProgressIndicator value={valB()} color="#6888e8" />
        <CircularProgressIndicator value={valC()} color="#8468e8" />
        <CircularProgressLabel>Disk space</CircularProgressLabel>
      </CircularProgress>
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
