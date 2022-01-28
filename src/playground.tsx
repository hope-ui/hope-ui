import "./playground.css";

import { render } from "solid-js/web";

import { Box, Button, Center, Flex, Heading, HopeProvider, HStack, Spacer, Text, VStack } from ".";

export function App() {
  return (
    <HopeProvider>
      <Flex>
        <Box boxSize="16" bg="danger500" />
        <Spacer />
        <Box boxSize="40" bg="danger500" />
        <Spacer />
        <Box boxSize="44" bg="danger500" />
      </Flex>
      <Box display="grid" gridTemplateColumns="3" gap="6">
        <Box boxSize="16" bg="info500" />
        <Box boxSize="40" bg="info500" />
        <Box boxSize="44" bg="info500" />
      </Box>
      <HStack spacing="1_5">
        <Box boxSize="16" bg="success500" />
        <Box boxSize="40" bg="success500" />
        <Box boxSize="44" bg="success500" />
      </HStack>
      <VStack spacing="1_5">
        <Box boxSize="16" bg="warning500" />
        <Box boxSize="40" bg="warning500" />
        <Box boxSize="44" bg="warning500" />
      </VStack>
    </HopeProvider>
  );
}

render(() => <App />, document.getElementById("root") as HTMLElement);
