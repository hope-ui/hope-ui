import { render } from "solid-js/web";

import { HopeProvider } from "../src";
import App from "./App";

render(
  () => (
    <HopeProvider withGlobalStyles>
      <App />
    </HopeProvider>
  ),
  document.getElementById("root") as HTMLDivElement
);
