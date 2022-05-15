import { render } from "solid-js/web";

import { HopeProvider, SimpleOption, SimpleSelect } from "../src";

function App() {
  return (
    <SimpleSelect placeholder="Choose a framework" w="300px">
      <SimpleOption value="react">React</SimpleOption>
      <SimpleOption value="angular" disabled>
        Angular
      </SimpleOption>
      <SimpleOption value="vue">Vue</SimpleOption>
      <SimpleOption value="svelte">Svelte</SimpleOption>
      <SimpleOption value="solid">Solid</SimpleOption>
    </SimpleSelect>
  );
}

// function App() {
//   return <div>Hello Hope UI</div>;
// }

render(
  () => (
    <HopeProvider>
      <App />
    </HopeProvider>
  ),
  document.getElementById("root") as HTMLDivElement
);
