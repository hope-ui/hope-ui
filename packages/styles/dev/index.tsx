import { onMount } from "solid-js";
import { For, render } from "solid-js/web";

import { Box, ThemeProvider } from "../src";

const range = [...Array(1500).keys()];

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

function App() {
  const startTime = new Date().getTime();

  onMount(() => {
    const endTime = new Date().getTime();
    console.log(endTime);
    console.log(startTime);

    console.log("duration [ms] = " + (endTime - startTime));
  });

  return (
    <ThemeProvider>
      <For each={range}>
        {(_, i) => (
          <Box
            h="100px"
            w={`${i() < 200 ? i() : 200}px`}
            borderWidth="3px"
            bg={["green.500", "zinc.500", "slate.100"]}
            borderStyle={["dashed", "solid", "dotted"]}
            _hover={{
              bg: ["green.700", "zinc.700", "slate.300"],
            }}
          >
            test case
          </Box>
        )}
      </For>
    </ThemeProvider>
  );
}

render(() => <App />, document.getElementById("root") as HTMLDivElement);

/*

*/
