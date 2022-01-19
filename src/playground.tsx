import { render } from "solid-js/web";

import { Box, HopeProvider } from ".";

function App() {
  return (
    <HopeProvider>
      <Box
        display="inline-flex"
        gap={19}
        flexDirection="column"
        p="$4"
        borderRadius="$md"
        bg="turquoise"
        color="whitesmoke"
      >
        <Box bg="tomato" boxSize="$10" css={{ "@lg": { boxSize: "$24" } }}>
          Box 1
        </Box>
        <Box bg="tomato" boxSize="$10" css={{ "@lg": { boxSize: "$24" } }}>
          Box 2
        </Box>
        <Box bg="tomato" boxSize="$10" css={{ "@lg": { boxSize: "$24" } }}>
          Box 3
        </Box>
      </Box>
    </HopeProvider>
  );
}

render(() => <App />, document.getElementById("root") as HTMLElement);
