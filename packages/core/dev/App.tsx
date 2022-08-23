import { Box, Button, hope, Text, useColorMode } from "../src";

export default function App() {
  const { toggleColorMode } = useColorMode();

  return (
    <>
      <Box bg={["tomato", "salmon", "crimson"]} w="100%" p={4} color="white">
        This is the Box
      </Box>
      <Text lineClamp={[1, null, 3, 4]}>
        "The quick brown fox jumps over the lazy dog" is an English-language pangram—a sentence that
        contains all of the letters of the English alphabet. Owing to its existence, Chakra was
        created. "The quick brown fox jumps over the lazy dog" is an English-language pangram—a
        sentence that contains all of the letters of the English alphabet. Owing to its existence,
        Chakra was created. "The quick brown fox jumps over the lazy dog" is an English-language
        pangram—a sentence that contains all of the letters of the English alphabet. Owing to its
        existence, Chakra was created.
      </Text>
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
