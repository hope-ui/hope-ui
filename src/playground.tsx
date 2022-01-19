import { render } from "solid-js/web";

import { Box, Center, HopeProvider } from ".";
import { hope } from "./components/factory";

const Box2 = hope("div");
const Center2 = hope(
  "div",
  {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  {
    color: "$success600",
    variants: {
      chien: {
        true: {},
      },
    },
  }
);

const Center3 = hope(Center2, {});

function App() {
  return (
    <HopeProvider>
      <Center3>Center 3</Center3>
      <Center2 boxSize="200px" bg="$primary100" role="group">
        <Box2
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
        </Box2>
        Chien
      </Center2>
      <Box2
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
      </Box2>
      <hope.a href="/" color="$success600" css={{ textTransform: "uppercase" }}>
        Hello
      </hope.a>
    </HopeProvider>
  );
}

render(() => <App />, document.getElementById("root") as HTMLElement);
