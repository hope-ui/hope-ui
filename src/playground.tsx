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
  useColorMode,
  VStack,
} from ".";
import { IconCheck } from "./components/icons/IconCheck";
import { IconExclamationTriangleSolid } from "./components/icons/IconExclamationTriangleSolid";
import { IconCheckCircleSolid } from "./components/icons/IconCheckCircleSolid";
import { IconCrossCircle } from "./components/icons/IconCrossCircle";

export function App() {
  const { toggleColorMode } = useColorMode();

  return (
    <Box p="$4">
      <HStack spacing="$4" mb="$4">
        <Button onClick={toggleColorMode}>Toggle color mode</Button>
      </HStack>
      <VStack alignItems="stretch" spacing="$4">
        <Progress value={80} />
        <Progress striped value={64} />
        <Progress striped animated value={64} />
        <Progress colorScheme="success" size="sm" value={20} />
        <Progress colorScheme="success" size="md" value={20} />
        <Progress colorScheme="success" size="lg" value={20} />
        <Progress colorScheme="success" height="32px" value={20} />
        <Progress value={20} size="xs" colorScheme="primary" />
        <Progress value={20} size="xs" colorScheme="neutral" />
        <Progress value={20} size="xs" colorScheme="success" />
        <Progress value={20} size="xs" colorScheme="info" />
        <Progress value={20} size="xs" colorScheme="warning" />
        <Progress value={20} size="xs" colorScheme="danger" />
        <Progress size="xs" indeterminate />
        <Progress size="xs" value={50}>
          <ProgressLabel>80%</ProgressLabel>
        </Progress>
        <Progress size="sm" value={50}>
          <ProgressLabel>80%</ProgressLabel>
        </Progress>
        <Progress size="md" value={50}>
          <ProgressLabel>80%</ProgressLabel>
        </Progress>
        <Progress size="lg" value={50}>
          <ProgressLabel>80%</ProgressLabel>
        </Progress>
        <Progress h="40px" value={50}>
          <ProgressLabel fontSize="40px">80%</ProgressLabel>
        </Progress>
        <UnorderedList>
          <ListItem>Lorem ipsum dolor sit amet</ListItem>
          <ListItem>Consectetur adipiscing elit</ListItem>
          <ListItem>Integer molestie lorem at massa</ListItem>
          <ListItem>Facilisis in pretium nisl aliquet</ListItem>
        </UnorderedList>
        <OrderedList>
          <ListItem>Lorem ipsum dolor sit amet</ListItem>
          <ListItem>Consectetur adipiscing elit</ListItem>
          <ListItem>Integer molestie lorem at massa</ListItem>
          <ListItem>Facilisis in pretium nisl aliquet</ListItem>
        </OrderedList>
        <List spacing="$3">
          <ListItem>
            <ListIcon as={IconCheckCircleSolid} color="$success9" />
            Lorem ipsum dolor sit amet, consectetur adipisicing elit
          </ListItem>
          <ListItem>
            <ListIcon as={IconCheckCircleSolid} color="$success9" />
            Assumenda, quia temporibus eveniet a libero incidunt suscipit
          </ListItem>
          <ListItem>
            <ListIcon as={IconCheckCircleSolid} color="$success9" />
            Quidem, ipsam illum quis sed voluptatum quae eum fugit earum
          </ListItem>
          {/* You can also use custom icons from react-icons */}
          <ListItem>
            <ListIcon as={IconCrossCircle} color="$danger9" />
            Quidem, ipsam illum quis sed voluptatum quae eum fugit earum
          </ListItem>
        </List>
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
