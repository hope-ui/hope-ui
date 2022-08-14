import { Button, HStack, useColorMode, VStack } from "../src";

export default function App() {
  const { toggleColorMode } = useColorMode();

  return (
    <>
      <button onClick={toggleColorMode}>Toggle color mode</button>
      <VStack spacing={4}>
        <HStack spacing={4}>
          <Button variant="solid" colorScheme="primary">
            Button
          </Button>
          <Button variant="soft" colorScheme="primary">
            Button
          </Button>
          <Button variant="outlined" colorScheme="primary">
            Button
          </Button>
          <Button variant="plain" colorScheme="primary">
            Button
          </Button>
        </HStack>
        <HStack spacing={4}>
          <Button variant="solid" colorScheme="neutral">
            Button
          </Button>
          <Button variant="soft" colorScheme="neutral">
            Button
          </Button>
          <Button variant="outlined" colorScheme="neutral">
            Button
          </Button>
          <Button variant="plain" colorScheme="neutral">
            Button
          </Button>
        </HStack>
        <HStack spacing={4}>
          <Button variant="solid" colorScheme="success">
            Button
          </Button>
          <Button variant="soft" colorScheme="success">
            Button
          </Button>
          <Button variant="outlined" colorScheme="success">
            Button
          </Button>
          <Button variant="plain" colorScheme="success">
            Button
          </Button>
        </HStack>
        <HStack spacing={4}>
          <Button variant="solid" colorScheme="info">
            Button
          </Button>
          <Button variant="soft" colorScheme="info">
            Button
          </Button>
          <Button variant="outlined" colorScheme="info">
            Button
          </Button>
          <Button variant="plain" colorScheme="info">
            Button
          </Button>
        </HStack>
        <HStack spacing={4}>
          <Button variant="solid" colorScheme="warning">
            Button
          </Button>
          <Button variant="soft" colorScheme="warning">
            Button
          </Button>
          <Button variant="outlined" colorScheme="warning">
            Button
          </Button>
          <Button variant="plain" colorScheme="warning">
            Button
          </Button>
        </HStack>
        <HStack spacing={4}>
          <Button variant="solid" colorScheme="danger">
            Button
          </Button>
          <Button variant="soft" colorScheme="danger">
            Button
          </Button>
          <Button variant="outlined" colorScheme="danger">
            Button
          </Button>
          <Button variant="plain" colorScheme="danger">
            Button
          </Button>
        </HStack>
      </VStack>
    </>
  );
}

/*
import { Button } from "../src";
import { onMount } from "solid-js";

const range = [...Array(3000).keys()];

export default function App() {
  const startTime = new Date().getTime();

  onMount(() => {
    const endTime = new Date().getTime();
    console.log(endTime - startTime);
  });

  return <For each={range}>{(_, i) => <Button>Button</Button>}</For>;
}
*/
