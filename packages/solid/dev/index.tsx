import { render } from "solid-js/web";

import { HopeProvider } from "../src";

function App() {
  return <></>;
}

render(
  () => (
    <HopeProvider>
      <App />
    </HopeProvider>
  ),
  document.getElementById("root") as HTMLDivElement
);
