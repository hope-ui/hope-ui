import "./playground.css";

import { render } from "solid-js/web";

import { Box, Center, Container, Flex, HopeProvider, Spacer } from ".";

export function App() {
  return (
    <HopeProvider>
      <Flex>
        <Center p="$4" bg="$danger500">
          Box 1
        </Center>
        <Spacer />
        <Center p="$4" bg="$success500">
          Box 2
        </Center>
      </Flex>
    </HopeProvider>
  );
}

render(() => <App />, document.getElementById("root") as HTMLElement);
