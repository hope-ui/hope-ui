import { Button, HStack, useColorMode, VStack } from "../src";

export default function App() {
  const { toggleColorMode } = useColorMode();

  return (
    <>
      <Button variant="soft" onClick={toggleColorMode} mb={4}>
        Toggle color mode
      </Button>
      <VStack spacing={4}>
        <HStack spacing={4}>
          <Button variant="solid" colorScheme="primary">
            Button
          </Button>
          <Button variant="solid" colorScheme="neutral">
            Button
          </Button>
          <Button variant="solid" colorScheme="success">
            Button
          </Button>
          <Button variant="solid" colorScheme="info">
            Button
          </Button>
          <Button variant="solid" colorScheme="warning">
            Button
          </Button>
          <Button variant="solid" colorScheme="danger">
            Button
          </Button>
          <Button variant="solid" colorScheme="primary" isDisabled>
            Button
          </Button>
        </HStack>
        <HStack spacing={4}>
          <Button variant="soft" colorScheme="primary">
            Button
          </Button>
          <Button variant="soft" colorScheme="neutral">
            Button
          </Button>
          <Button variant="soft" colorScheme="success">
            Button
          </Button>
          <Button variant="soft" colorScheme="info">
            Button
          </Button>
          <Button variant="soft" colorScheme="warning">
            Button
          </Button>
          <Button variant="soft" colorScheme="danger">
            Button
          </Button>
          <Button variant="soft" colorScheme="primary" isDisabled>
            Button
          </Button>
        </HStack>
        <HStack spacing={4}>
          <Button variant="outlined" colorScheme="primary">
            Button
          </Button>
          <Button variant="outlined" colorScheme="neutral">
            Button
          </Button>
          <Button variant="outlined" colorScheme="success">
            Button
          </Button>
          <Button variant="outlined" colorScheme="info">
            Button
          </Button>
          <Button variant="outlined" colorScheme="warning">
            Button
          </Button>
          <Button variant="outlined" colorScheme="danger">
            Button
          </Button>
          <Button variant="outlined" colorScheme="primary" isDisabled>
            Button
          </Button>
        </HStack>
        <HStack spacing={4}>
          <Button variant="plain" colorScheme="primary">
            Button
          </Button>
          <Button variant="plain" colorScheme="neutral">
            Button
          </Button>
          <Button variant="plain" colorScheme="success">
            Button
          </Button>
          <Button variant="plain" colorScheme="info">
            Button
          </Button>
          <Button variant="plain" colorScheme="warning">
            Button
          </Button>
          <Button variant="plain" colorScheme="danger">
            Button
          </Button>
          <Button variant="plain" colorScheme="primary" isDisabled>
            Button
          </Button>
        </HStack>
      </VStack>
    </>
  );
}

/*
import { For } from "solid-js";

import { Button, hope } from "../src";

const range = [...Array(3000).keys()];

export default function App() {
  const startTime = new Date().getTime();

  return (
    <>
      <For each={range}>{(_, i) => <Button>Button</Button>}</For>
      <hope.div
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          bg: "tomato",
          color: "white",
          p: 4,
        }}
      >
        {new Date().getTime() - startTime}
      </hope.div>
    </>
  );
}
*/
