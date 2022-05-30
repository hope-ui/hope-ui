import "./index.scss";

import { render } from "solid-js/web";

import { HopeProvider, Kbd, useColorMode } from "../src";

function App() {
  const { toggleColorMode } = useColorMode();

  return (
    <div
      style={{ display: "flex", "flex-direction": "column", "align-items": "center", gap: "16px" }}
    >
      <button onClick={toggleColorMode}>Toggle color mode</button>
      <Kbd>shift</Kbd>
    </div>
  );
}

render(
  () => (
    <HopeProvider>
      <App />
    </HopeProvider>
  ),
  document.getElementById("root") as HTMLDivElement
);
