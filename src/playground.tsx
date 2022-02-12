import "./playground.css";

import { createSignal } from "solid-js";
import { render } from "solid-js/web";

import {
  Anchor,
  Box,
  Button,
  Center,
  Checkbox,
  FormControl,
  FormLabel,
  HopeProvider,
  HStack,
  IconButton,
  IconMoon,
  IconSun,
  Input,
  useColorMode,
  useColorModeValue,
  VStack,
} from ".";

export function App() {
  const { toggleColorMode } = useColorMode();
  const cardBg = useColorModeValue("white", "$neutral2");
  const icon = useColorModeValue(<IconMoon />, <IconSun />);

  return (
    <Box p="$4">
      <Center flexDirection="column" boxSize="$full">
        <IconButton
          aria-label="Toggle color mode"
          icon={icon}
          mb="$4"
          size="sm"
          colorScheme="neutral"
          variant="subtle"
          onClick={toggleColorMode}
        />
        <HStack spacing="$5">
          <Box bg={cardBg()} p="$4" w="$sm" shadow="$sm" rounded="$sm">
            <VStack as="form" spacing="$5">
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input type="email" placeholder="email" />
              </FormControl>
              <FormControl>
                <FormLabel>Password</FormLabel>
                <Input type="password" placeholder="password" />
              </FormControl>
              <HStack justifyContent="space-between" w="$full">
                <Checkbox>Remember me</Checkbox>
                <Anchor href="#" color="$primary9">
                  Forgot your password ?
                </Anchor>
              </HStack>
              <Button fullWidth>Login</Button>
            </VStack>
          </Box>
          <Box bg={cardBg()} p="$4" w="$sm" shadow="$sm" rounded="$sm">
            <VStack as="form" spacing="$5">
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input variant="filled" type="email" placeholder="email" />
              </FormControl>
              <FormControl>
                <FormLabel>Password</FormLabel>
                <Input variant="filled" type="password" placeholder="password" />
              </FormControl>
              <HStack justifyContent="space-between" w="$full">
                <Checkbox variant="filled">Remember me</Checkbox>
                <Anchor href="#" color="$primary9">
                  Forgot your password ?
                </Anchor>
              </HStack>
              <Button fullWidth>Login</Button>
            </VStack>
          </Box>
        </HStack>
      </Center>
    </Box>
  );
}

render(
  () => (
    <HopeProvider>
      <App />
    </HopeProvider>
  ),
  document.getElementById("root") as HTMLElement
);
