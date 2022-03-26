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
  MenuGroup,
  MenuItem,
  MenuLabel,
  MenuTrigger,
  useColorMode,
  VStack,
} from ".";
import { IconCrossCircle } from "./components/icons/IconCrossCircle";

export function App() {
  const { toggleColorMode } = useColorMode();

  const onDownload = (event: Event) => {
    console.log(event);
  };

  return (
    <Box p="$4">
      <HStack spacing="$4" mb="$4">
        <Button variant="subtle" colorScheme="neutral" onClick={toggleColorMode}>
          Toggle color mode
        </Button>
      </HStack>
      <VStack spacing="$4" alignItems="flex-start">
        <Menu>
          <MenuTrigger as={Button} rightIcon={<IconCrossCircle />}>
            Actions
          </MenuTrigger>
          <MenuContent>
            <MenuItem onSelect={onDownload}>Download</MenuItem>
            <MenuItem>Create a Copy</MenuItem>
            <MenuItem>Mark as Draft</MenuItem>
            <MenuItem>Delete</MenuItem>
            <MenuItem disabled>Dave</MenuItem>
            <MenuItem>Didi</MenuItem>
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
