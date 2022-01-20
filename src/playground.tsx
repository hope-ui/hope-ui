import { render } from "solid-js/web";

import { Box, HopeProvider } from ".";

function App() {
  return (
    <HopeProvider>
      <Box bg="$primary500" w="$full" p="$4" color="white">
        Box with token-aware style props
      </Box>
    </HopeProvider>
  );
}

render(() => <App />, document.getElementById("root") as HTMLElement);
