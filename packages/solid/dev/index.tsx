import { For } from "solid-js";
import { render } from "solid-js/web";

import { HopeProvider, SimpleOption, SimpleSelect } from "../src";

function App() {
  return (
    <SimpleSelect placeholder="Pick a number">
      <For each={Array(100).fill(0)}>
        {(_, i) => <SimpleOption value={i()}>{i()}</SimpleOption>}
      </For>
    </SimpleSelect>
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
