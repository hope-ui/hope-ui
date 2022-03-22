import "./playground.css";

import { createSignal } from "solid-js";
import { render } from "solid-js/web";

import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  FormLabel,
  HopeProvider,
  HopeThemeConfig,
  HStack,
  IconButton,
  Radio,
  RadioGroup,
  SimpleOption,
  SimpleSelect,
  useColorMode,
  VStack,
} from ".";
import { IconCheck } from "./components/icons/IconCheck";

export function App() {
  const { toggleColorMode } = useColorMode();

  const [gender, setGender] = createSignal<string>();

  return (
    <Box p="$4">
      <HStack spacing="$4" mb="$4">
        <Button variant="subtle" colorScheme="neutral" onClick={toggleColorMode}>
          Toggle color mode
        </Button>
        <Button></Button>
        <ButtonGroup size="sm" attached variant="outline">
          <Button mr="-1px">Save</Button>
          <IconButton aria-label="Add to friends" icon={<IconCheck />} />
        </ButtonGroup>
      </HStack>
      <VStack spacing="$4" alignItems="flex-start">
        <FormControl>
          <FormLabel>Gender</FormLabel>
          <RadioGroup name="gender" value={gender()} onChange={setGender}>
            <HStack spacing="$5">
              <Radio value="male">Male</Radio>
              <Radio value="female">Female</Radio>
              <Radio value="other">Other</Radio>
            </HStack>
          </RadioGroup>
        </FormControl>
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
