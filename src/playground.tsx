import "./playground.css";

import { render } from "solid-js/web";

import {
  Box,
  Button,
  HopeProvider,
  HopeThemeConfig,
  HStack,
  List,
  ListIcon,
  ListItem,
  OrderedList,
  Progress,
  ProgressLabel,
  UnorderedList,
  CircularProgress,
  CircularProgressLabel,
  useColorMode,
  VStack,
  Breadcrumb,
  BreadcrumbLink,
} from ".";

export function App() {
  const { toggleColorMode } = useColorMode();

  return (
    <Box p="$4">
      <HStack spacing="$4" mb="$4">
        <Button onClick={toggleColorMode}>Toggle color mode</Button>
      </HStack>
      <VStack alignItems="stretch" spacing="$4">
        <Progress value={80} color="$success9" trackColor="$success3" borderRadius="$full" />
        <CircularProgress color="tomato" value={80} />
        <CircularProgress value={30} size="120px" />
        <CircularProgress value={59} size="100px" thickness="4px" />
        <CircularProgress value={30} color="$warning9" thickness="12px" />
        <CircularProgress value={40} color="$success9">
          <CircularProgressLabel>40%</CircularProgressLabel>
        </CircularProgress>
        <CircularProgress indeterminate color="$success9" />
        <CircularProgress value={0} color="$success9"></CircularProgress>
        <Breadcrumb>
          <BreadcrumbLink href="#">Home</BreadcrumbLink>
          <BreadcrumbLink href="#">Docs</BreadcrumbLink>
          <BreadcrumbLink currentPage>Breadcrumb</BreadcrumbLink>
        </Breadcrumb>
        <Breadcrumb fontWeight="$medium" fontSize="$sm" spacing="$4">
          <BreadcrumbLink href="#" _hover={{ color: "tomato" }}>
            Home
          </BreadcrumbLink>
          <BreadcrumbLink href="#" _hover={{ color: "tomato" }}>
            About
          </BreadcrumbLink>
          <BreadcrumbLink currentPage _hover={{ color: "$success9" }}>
            Current
          </BreadcrumbLink>
        </Breadcrumb>
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
