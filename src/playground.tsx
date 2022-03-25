/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable simple-import-sort/imports */

import "./playground.css";

import { createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { render } from "solid-js/web";

import {
  Box,
  Button,
  HopeProvider,
  HopeThemeConfig,
  HStack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useColorMode,
  VStack,
} from ".";
import { IconCrossCircle } from "./components/icons/IconCrossCircle";
import { Input } from "./components";

export function App() {
  const { toggleColorMode } = useColorMode();

  const [disabled, setDisabled] = createSignal(false);

  return (
    <Box p="$4">
      <HStack spacing="$4" mb="$4">
        <Button variant="subtle" colorScheme="neutral" onClick={toggleColorMode}>
          Toggle color mode
        </Button>
        <Button onClick={() => setDisabled(prev => !prev)}>Toggle disabled</Button>
      </HStack>
      <VStack spacing="$4" alignItems="flex-start">
        <Tabs fitted>
          <TabList>
            <Tab>One</Tab>
            <Tab disabled={disabled()}>Two</Tab>
            <Tab>Three</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <p>one!</p>
            </TabPanel>
            <TabPanel>
              <p>two!</p>
            </TabPanel>
            <TabPanel>
              <p>three!</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
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
