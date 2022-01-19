import { render } from "solid-js/web";

import { Box, HopeProvider } from ".";

function App() {
  return (
    <HopeProvider>
      <Box display="flex" gap={19} flexDirection="column">
        <Box bg="tomato" boxSize="$10" css={{ "@lg": { boxSize: "$24" } }}>
          Box 1
        </Box>
        <Box bg="tomato" boxSize="$10" css={{ "@lg": { boxSize: "$24" } }}>
          Box 1
        </Box>
        <Box bg="tomato" boxSize="$10" css={{ "@lg": { boxSize: "$24" } }}>
          Box 1
        </Box>
      </Box>
    </HopeProvider>
  );
}

render(() => <App />, document.getElementById("root") as HTMLElement);
