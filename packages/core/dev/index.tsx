import "./index.scss";

import { render } from "solid-js/web";

import { HopeProvider, useColorMode } from "../src";

function App() {
  const { toggleColorMode } = useColorMode();

  return <div>Hello Hope UI</div>;
}

render(
  () => (
    <HopeProvider>
      <App />
    </HopeProvider>
  ),
  document.getElementById("root") as HTMLDivElement
);
