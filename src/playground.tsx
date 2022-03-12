import "./playground.css";

import { render } from "solid-js/web";

import {
  Avatar,
  AvatarBadge,
  AvatarGroup,
  AvatarExcess,
  Box,
  Button,
  HopeProvider,
  HopeThemeConfig,
  HStack,
  useColorMode,
} from ".";
import { IconCheckCircleSolid } from "./components/icons/IconCheckCircleSolid";

export function App() {
  const { toggleColorMode } = useColorMode();

  return (
    <Box p="$4">
      <HStack spacing="$4">
        <Button onClick={toggleColorMode}>Toggle color mode</Button>
      </HStack>
      <HStack spacing="$4">
        <Avatar />
        <Avatar icon={props => <IconCheckCircleSolid {...props} />} />
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
      <AvatarGroup size="2xs" max={2}>
        <Avatar name="Ryan Florence" src="https://bit.ly/ryan-florence" />
        <Avatar name="Segun Adebayo" src="https://bit.ly/sage-adebayo" />
        <Avatar name="Kent Dodds" src="https://bit.ly/kent-c-dodds" />
        <Avatar name="Prosper Otemuyiwa" src="https://bit.ly/prosper-baba" />
        <Avatar name="Christian Nwamba" src="https://bit.ly/code-beast" />
      </AvatarGroup>
      <AvatarGroup size="xs" max={2}>
        <Avatar name="Ryan Florence" src="https://bit.ly/ryan-florence" />
        <Avatar name="Segun Adebayo" src="https://bit.ly/sage-adebayo" />
        <Avatar name="Kent Dodds" src="https://bit.ly/kent-c-dodds" />
        <Avatar name="Prosper Otemuyiwa" src="https://bit.ly/prosper-baba" />
        <Avatar name="Christian Nwamba" src="https://bit.ly/code-beast" />
      </AvatarGroup>
      <AvatarGroup size="sm" max={2}>
        <Avatar name="Ryan Florence" src="https://bit.ly/ryan-florence" />
        <Avatar name="Segun Adebayo" src="https://bit.ly/sage-adebayo" />
        <Avatar name="Kent Dodds" src="https://bit.ly/kent-c-dodds" />
        <Avatar name="Prosper Otemuyiwa" src="https://bit.ly/prosper-baba" />
        <Avatar name="Christian Nwamba" src="https://bit.ly/code-beast" />
      </AvatarGroup>
      <AvatarGroup max={2}>
        <Avatar name="Ryan Florence" src="https://bit.ly/ryan-florence" />
        <Avatar name="Segun Adebayo" src="https://bit.ly/sage-adebayo" />
        <Avatar name="Kent Dodds" src="https://bit.ly/kent-c-dodds" />
        <Avatar name="Prosper Otemuyiwa" src="https://bit.ly/prosper-baba" />
        <Avatar name="Christian Nwamba" src="https://bit.ly/code-beast" />
      </AvatarGroup>
      <AvatarGroup size="lg" max={2}>
        <Avatar name="Ryan Florence" src="https://bit.ly/ryan-florence" />
        <Avatar name="Segun Adebayo" src="https://bit.ly/sage-adebayo" />
        <Avatar name="Kent Dodds" src="https://bit.ly/kent-c-dodds" />
        <Avatar name="Prosper Otemuyiwa" src="https://bit.ly/prosper-baba" />
        <Avatar name="Christian Nwamba" src="https://bit.ly/code-beast" />
      </AvatarGroup>
      <AvatarGroup size="xl" max={2}>
        <Avatar name="Ryan Florence" src="https://bit.ly/ryan-florence" />
        <Avatar name="Segun Adebayo" src="https://bit.ly/sage-adebayo" />
        <Avatar name="Kent Dodds" src="https://bit.ly/kent-c-dodds" />
        <Avatar name="Prosper Otemuyiwa" src="https://bit.ly/prosper-baba" />
        <Avatar name="Christian Nwamba" src="https://bit.ly/code-beast" />
      </AvatarGroup>
      <AvatarGroup size="2xl" max={2}>
        <Avatar name="Ryan Florence" src="https://bit.ly/ryan-florence" />
        <Avatar name="Segun Adebayo" src="https://bit.ly/sage-adebayo" />
        <Avatar name="Kent Dodds" src="https://bit.ly/kent-c-dodds" />
        <Avatar name="Prosper Otemuyiwa" src="https://bit.ly/prosper-baba" />
        <Avatar name="Christian Nwamba" src="https://bit.ly/code-beast" />
      </AvatarGroup>
      <AvatarGroup size="2xl" borderRadius="$lg" borderWidth="8px">
        <Avatar name="Ryan Florence" src="https://bit.ly/ryan-florence" />
        <Avatar name="Segun Adebayo" src="https://bit.ly/sage-adebayo" />
        <Avatar name="Kent Dodds" src="https://bit.ly/kent-c-dodds" />
        <Avatar name="Prosper Otemuyiwa" src="https://bit.ly/prosper-baba" />
        <Avatar name="Christian Nwamba" src="https://bit.ly/code-beast" />
      </AvatarGroup>
      <AvatarGroup size="2xl">
        <Avatar name="Ryan Florence" src="https://bit.ly/ryan-florence" />
        <Avatar name="Segun Adebayo" src="https://bit.ly/sage-adebayo" />
        <Avatar name="Kent Dodds" src="https://bit.ly/kent-c-dodds" />
        <Avatar name="Prosper Otemuyiwa" src="https://bit.ly/prosper-baba" />
        <Avatar name="Christian Nwamba" src="https://bit.ly/code-beast" />
        <AvatarExcess>+72</AvatarExcess>
      </AvatarGroup>
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

/*

// Render props
<Tooltip>
  {(triggerProps) => (
    <Button
      variant="subtle"
      colorScheme="warning"
      size="sm"
      leftIcon={<IconPlus boxSize="$6" />}
      {...triggerProps}
    >
      Button
    </Button>
  )}
</Tooltip>

// Compound component
<Tooltip>
  <TooltipTrigger 
    as={Button} 
    variant="subtle"
    colorScheme="warning"
    size="sm"
    leftIcon={<IconPlus boxSize="$6" />} 
  >
    Button
  </TooltipTrigger>
</Tooltip>
*/
