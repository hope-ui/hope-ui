import "./playground.css";

import { createSignal } from "solid-js";
import { render } from "solid-js/web";

import {
  Box,
  Button,
  CircularProgress,
  CircularProgressIndicator,
  CircularProgressLabel,
  HopeProvider,
  HopeThemeConfig,
  HStack,
  useColorMode,
  VStack,
  Avatar,
  AvatarBadge,
  AvatarGroup,
  AvatarRemaining,
  Breadcrumb,
  BreadcrumbLink,
  Progress,
  ProgressIndicator,
  ProgressLabel,
  BreadcrumbItem,
  BreadcrumbSeparator,
} from ".";
import { IconCheckCircleSolid } from "./components/icons/IconCheckCircleSolid";

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
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Home</BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Docs</BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink currentPage>Breadcrumb</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        <AvatarGroup size="md">
          <Avatar name="Hector Rhodes" src="https://bit.ly/3pWHo72" />
          <Avatar name="Isabella Mckinney" src="https://bit.ly/3tRVozX" />
          <Avatar name="Courtney Watson" src="https://bit.ly/3w2rgom" />
          <Avatar name="Alberto Sanchez" src="https://bit.ly/3q1WqrX" />
          <Avatar name="Nicole Steeves" src="https://bit.ly/37dJ0m7" />
          <AvatarRemaining>+3</AvatarRemaining>
        </AvatarGroup>
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
