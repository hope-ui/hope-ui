import "./playground.css";

import { createSignal, Show } from "solid-js";
import { render } from "solid-js/web";

import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HopeProvider,
  HopeThemeConfig,
  HStack,
  Input,
  useColorMode,
  VStack,
} from ".";

export function App() {
  const { toggleColorMode } = useColorMode();

  const [value, setValue] = createSignal("");

  const handleInput = (e: any) => setValue(e.target.value);

  const isInvalid = () => value() === "";

  return (
    <Box p="$4">
      <HStack spacing="$4" mb="$4">
        <Button onClick={toggleColorMode}>Toggle color mode</Button>
      </HStack>
      <VStack alignItems="stretch" spacing="$4">
        <FormControl invalid={isInvalid()}>
          <FormLabel for="email">Email address</FormLabel>
          <Input id="email" type="email" value={value()} onInput={handleInput} />
          <Show
            when={isInvalid()}
            fallback={<FormHelperText>Enter the email you'd like to receive the newsletter on.</FormHelperText>}
          >
            <FormErrorMessage>Email is required.</FormErrorMessage>
          </Show>
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
