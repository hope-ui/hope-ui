import "./playground.css";

import { render } from "solid-js/web";

import { Box, Button, Center, Flex, Heading, HopeProvider, Spacer, Text } from ".";

export function App() {
  return (
    <HopeProvider>
      <Flex>
        <Box p="2">
          <Heading size="base">Chakra App</Heading>
        </Box>
        <Spacer />
        <Box>
          <Button colorScheme="primary" mr="4">
            Sign Up
          </Button>
          <Button colorScheme="primary">Log in</Button>
        </Box>
      </Flex>
    </HopeProvider>
  );
}

render(() => <App />, document.getElementById("root") as HTMLElement);
