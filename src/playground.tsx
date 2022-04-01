import "./playground.css";

import { render } from "solid-js/web";

import {
  Box,
  Button,
  ButtonGroup,
  HopeProvider,
  HopeThemeConfig,
  HStack,
  Popover,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  useColorMode,
} from ".";

export function App() {
  const { toggleColorMode } = useColorMode();

  return (
    <Box p="$4">
      <HStack spacing="$4" mb="$4">
        <Button variant="subtle" colorScheme="neutral" onClick={toggleColorMode}>
          Toggle color mode
        </Button>
      </HStack>
      <Popover triggerType="hover">
        <PopoverTrigger as={Button}>Trigger</PopoverTrigger>
        <PopoverContent>
          <PopoverCloseButton />
          <PopoverHeader>Confirmation!</PopoverHeader>
          <PopoverBody>Are you sure you want to have that milkshake?</PopoverBody>
        </PopoverContent>
      </Popover>
      <Popover initialFocus="#next" placement="right-end" closeOnBlur={false}>
        <PopoverTrigger as={Button}>Trigger</PopoverTrigger>
        <PopoverContent color="white" bg="$info11" borderColor="$info11">
          <PopoverHeader pt="$4" fontWeight="$bold" border="0">
            Manage Your Channels
          </PopoverHeader>
          <PopoverCloseButton />
          <PopoverBody>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et
            dolore.
          </PopoverBody>
          <PopoverFooter border="0" d="flex" alignItems="center" justifyContent="space-between" pb="$4">
            <Box fontSize="$sm">Step 2 of 4</Box>
            <ButtonGroup size="sm">
              <Button colorScheme="success">Setup Email</Button>
              <Button id="next" colorScheme="info">
                Next
              </Button>
            </ButtonGroup>
          </PopoverFooter>
        </PopoverContent>
      </Popover>
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
