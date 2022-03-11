import "./playground.css";

import { render } from "solid-js/web";

import { Avatar, AvatarBadge, Box, Button, HopeProvider, HopeThemeConfig, HStack, useColorMode } from ".";

export function App() {
  const { toggleColorMode } = useColorMode();

  return (
    <Box p="$4">
      <HStack spacing="$4">
        <Button onClick={toggleColorMode}>Toggle color mode</Button>
      </HStack>
      <HStack spacing="$4">
        <Avatar size="2xs" name="Dan Abrahmov" src="https://bit.ly/dan-abramov">
          <AvatarBadge boxSize="1.25em" bg="$success9" />
        </Avatar>
        <Avatar size="xs" name="Kola Tioluwani" src="https://bit.ly/tioluwani-kolawole">
          <AvatarBadge boxSize="1.25em" bg="$success9" />
        </Avatar>
        <Avatar size="sm" name="Kent Dodds" src="https://bit.ly/kent-c-dodds">
          <AvatarBadge boxSize="1.25em" bg="$success9" />
        </Avatar>
        <Avatar size="md" name="Ryan Florence" src="https://bit.ly/ryan-florence">
          <AvatarBadge boxSize="1.25em" bg="$success9" />
        </Avatar>
        <Avatar size="lg" name="Prosper Otemuyiwa" src="https://bit.ly/prosper-baba">
          <AvatarBadge boxSize="1.25em" bg="$success9" />
        </Avatar>
        <Avatar size="xl" name="Christian Nwamba" src="https://bit.ly/code-beast">
          <AvatarBadge boxSize="1.25em" bg="$success9" />
        </Avatar>
        <Avatar size="2xl" name="Segun Adebayo" src="https://bit.ly/sage-adebayo">
          <AvatarBadge boxSize="1.25em" bg="$success9" />
        </Avatar>
      </HStack>
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
