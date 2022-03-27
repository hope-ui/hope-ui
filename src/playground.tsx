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
import { Checkbox, CheckboxControl, CheckboxLabel } from "./components";
import { IconCrossCircle } from "./components/icons/IconCrossCircle";
import { IconExclamationTriangleSolid } from "./components/icons/IconExclamationTriangleSolid";

export function App() {
  const { toggleColorMode } = useColorMode();

  const onDownload = () => {
    console.log("download");
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
            <MenuGroup>
              <MenuItem onSelect={onDownload}>Download</MenuItem>
            </MenuGroup>
            <MenuGroup>
              <MenuLabel>Foo</MenuLabel>
              <MenuItem>Create a Copy</MenuItem>
              <MenuItem closeOnSelect={false}>Mark as Draft</MenuItem>
              <MenuItem disabled>Delete</MenuItem>
            </MenuGroup>
            <MenuItem colorScheme="primary" icon={<IconExclamationTriangleSolid />} iconSpacing="$4">
              Attend a Workshop
            </MenuItem>
            <MenuItem colorScheme="neutral" icon={<IconExclamationTriangleSolid />} command="⌘K">
              Attend a Workshop
            </MenuItem>
            <MenuItem colorScheme="success" icon={<IconExclamationTriangleSolid />}>
              Attend a Workshop
            </MenuItem>
            <MenuItem colorScheme="info" icon={<IconExclamationTriangleSolid />}>
              Attend a Workshop
            </MenuItem>
            <MenuItem colorScheme="warning" icon={<IconExclamationTriangleSolid />}>
              Attend a Workshop
            </MenuItem>
            <MenuItem colorScheme="danger" icon={<IconExclamationTriangleSolid />}>
              Attend a Workshop
            </MenuItem>
          </MenuContent>
        </Menu>
        <Checkbox>
          <CheckboxControl />
          <CheckboxLabel>Checkbox</CheckboxLabel>
        </Checkbox>
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
