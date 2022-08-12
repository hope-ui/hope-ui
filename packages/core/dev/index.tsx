import { onMount } from "solid-js";
import { For, render } from "solid-js/web";

import { Button, HopeProvider } from "../src";

const range = [...Array(3000).keys()];

function App() {
  const startTime = new Date().getTime();

  onMount(() => {
    const endTime = new Date().getTime();
    console.log(endTime);
    console.log(startTime);

    console.log("duration [ms] = " + (endTime - startTime));
  });

  return (
    <HopeProvider withGlobalStyles>
      <For each={range}>{(_, i) => <Button>Button</Button>}</For>
    </HopeProvider>
  );
}

render(() => <App />, document.getElementById("root") as HTMLDivElement);
