import { render } from "solid-js/web";

import { Box, Center, HopeProvider } from ".";

function App() {
  return (
    <HopeProvider>
      <Center boxSize="200px" bg="$primary500" role="group">
        <Box
          as="button"
          borderRadius="$md"
          bg="tomato"
          color="white"
          px="$4"
          h="$8"
          css={{
            [`${Center} &`]: {
              bg: "Red",
            },
          }}
          _groupHover={{
            borderRadius: "$full",
          }}
        >
          Button
        </Box>
      </Center>
      <Box
        as="button"
        borderRadius="$md"
        bg="tomato"
        color="white"
        px="$4"
        h="$8"
        css={{
          [`${Center} &`]: {
            bg: "green",
          },
        }}
        _hover={{
          bg: "$primary500",
        }}
      >
        Button
      </Box>
    </HopeProvider>
  );
}

render(() => <App />, document.getElementById("root") as HTMLElement);
