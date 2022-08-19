import { render } from "solid-js/web";

import { Box, extendTheme, HopeProvider } from "../src";
import App from "./App";

const theme = extendTheme({});

render(
  () => (
    <HopeProvider withGlobalStyles>
      <Box p={4}>
        <App />
      </Box>
    </HopeProvider>
  ),
  document.getElementById("root") as HTMLDivElement
);
