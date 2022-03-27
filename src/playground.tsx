import "./playground.css";

import { render } from "solid-js/web";

import {
  Box,
  Button,
  HopeProvider,
  HopeThemeConfig,
  HStack,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
  useColorMode,
  VStack,
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
      <VStack spacing="$4" alignItems="flex-start">
        <Menu>
          {({ opened }) => (
            <>
              <MenuTrigger as={Button}>{opened() ? "Close" : "Open"}</MenuTrigger>
              {/* <MenuTrigger as={Button}>Actions</MenuTrigger> */}
              <MenuContent>
                <MenuItem>Download</MenuItem>
                <MenuItem onClick={() => alert("Kagebunshin")}>Create a Copy</MenuItem>
              </MenuContent>
            </>
          )}
        </Menu>
        <Menu>
          <MenuTrigger as={Button}>Actions</MenuTrigger>
          <MenuContent>
            <MenuItem>Download</MenuItem>
            <MenuItem>Create a Copy</MenuItem>
            <MenuItem>Mark as Draft</MenuItem>
            <MenuItem>Delete</MenuItem>
            <MenuItem>Attend a Workshop</MenuItem>
          </MenuContent>
        </Menu>
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
