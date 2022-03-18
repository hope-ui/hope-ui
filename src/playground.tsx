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
  ProgressIndicator,
  ProgressLabel,
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
      <Button onClick={() => setValZ(prev => prev + 5)}>Inc Z</Button>
      <Button onClick={() => setValZ(0)}>Reset Z</Button>
      <Button onClick={() => setValA(prev => prev + 5)}>Inc A</Button>
      <Button onClick={() => setValB(prev => prev + 5)}>Inc B</Button>
      <Button onClick={() => setValC(prev => prev + 5)}>Inc C</Button>
      <Progress mb="$4">
        <ProgressIndicator value={valZ()}>
          <ProgressLabel>{valZ()}%</ProgressLabel>
        </ProgressIndicator>
      </Progress>
      <Progress size="lg" rounded="$sm">
        <ProgressIndicator value={valA()} colorScheme="slateblue">
          <ProgressLabel>{valA()}%</ProgressLabel>
        </ProgressIndicator>
        <ProgressIndicator value={valB()} colorScheme="dodgerblue">
          <ProgressLabel>{valB()}%</ProgressLabel>
        </ProgressIndicator>
        <ProgressIndicator value={valC()} colorScheme="skyblue">
          <ProgressLabel>{valC()}%</ProgressLabel>
        </ProgressIndicator>
      </Progress>
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
