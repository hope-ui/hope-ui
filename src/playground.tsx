import "./playground.css";

import { createSignal, For } from "solid-js";
import { render } from "solid-js/web";

import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  HopeProvider,
  HopeThemeConfig,
  HStack,
  Select,
  SelectContent,
  SelectIcon,
  SelectListbox,
  SelectOption,
  SelectOptionIndicator,
  SelectOptionText,
  SelectPlaceholder,
  SelectTrigger,
  SelectValue,
  useColorMode,
} from ".";
import { IconCaretDown } from "./components/icons/IconCaretDown";
import { IconCheckCircleSolid } from "./components/icons/IconCheckCircleSolid";

export function App() {
  const { toggleColorMode } = useColorMode();

  const [isDisabled, setIsDisabled] = createSignal(false);
  const [idx, setIdx] = createSignal<number[]>([]);

  return (
    <Box p="$4">
      <HStack spacing="$4" mb="$4">
        <Button variant="subtle" colorScheme="neutral" onClick={toggleColorMode}>
          Toggle color mode
        </Button>
        <Button onClick={() => setIsDisabled(prev => !prev)}>Toggle isDisabled</Button>
        <Button onClick={() => setIdx(prev => (prev.length === 0 ? [0, 1] : []))}>Toggle all</Button>
      </HStack>
      <p>idx : {idx()}</p>
      <Accordion allowMultiple index={idx()} onChange={(val: number[]) => setIdx(val)}>
        <AccordionItem disabled={isDisabled()}>
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                Section 1 title
              </Box>
              <AccordionIcon as={IconCheckCircleSolid} />
            </AccordionButton>
          </h2>
          <AccordionPanel pb="$4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
            ea commodo consequat.
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                Section 2 title
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb="$4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
            ea commodo consequat.
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem disabled={isDisabled()}>
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                Section 3 title
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb="$4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
            ea commodo consequat.
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                Section 4 title
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb="$4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
            ea commodo consequat.
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
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
