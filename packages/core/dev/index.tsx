import { render } from "solid-js/web";

import { ColorModeScript, extendTheme, HopeProvider } from "../src";
import App from "./App";

const theme = extendTheme({});

render(
  () => (
    <>
      <ColorModeScript />
      <HopeProvider theme={theme}>
        <App />
      </HopeProvider>
    </>
  ),
  document.getElementById("root") as HTMLDivElement
);
