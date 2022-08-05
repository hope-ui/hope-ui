import { onMount } from "solid-js";
import { render } from "solid-js/web";

import { Box, hope, HopeProvider } from "../src";

function App() {
  let ref: HTMLDivElement | undefined;

  onMount(() => console.log(ref));

  return (
    <HopeProvider>
      <Box ref={ref}>hi</Box>
    </HopeProvider>
  );
}

render(() => <App />, document.getElementById("root") as HTMLDivElement);
