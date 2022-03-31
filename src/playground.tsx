import "./playground.css";

import { createSignal } from "solid-js";
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
  Tabs,
  useColorMode,
  VStack,
} from ".";

export function App() {
  const { toggleColorMode } = useColorMode();

  const [isDisabled, setIsDisabled] = createSignal(false);

  return (
    <Box p="$4">
      <HStack spacing="$4" mb="$4">
        <Button variant="subtle" colorScheme="neutral" onClick={toggleColorMode}>
          Toggle color mode
        </Button>
        <Button onClick={() => setIsDisabled(prev => !prev)}>Toggle isDisabled</Button>
      </HStack>
      <VStack spacing="$4" alignItems="flex-start">
        <Tabs>
          <TabList>
            <Tab>One</Tab>
            <Tab disabled={isDisabled()}>Two</Tab>
            <Tab>Three</Tab>
            <Tab>Four</Tab>
            <Tab>Five</Tab>
            <Tab disabled={isDisabled()}>Six</Tab>
          </TabList>
          <TabPanel>1</TabPanel>
          <TabPanel>2</TabPanel>
          <TabPanel>3</TabPanel>
          <TabPanel>4</TabPanel>
          <TabPanel>5</TabPanel>
          <TabPanel>6</TabPanel>
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
