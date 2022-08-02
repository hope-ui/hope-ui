import { onMount } from "solid-js";
import { For, render } from "solid-js/web";

import { Box, ThemeProvider } from "../src";

const range = [...Array(1000).keys()];

function App() {
  const startTime = new Date().getTime();

  onMount(() => {
    const endTime = new Date().getTime();
    console.log(endTime);
    console.log(startTime);

    console.log("duration [ms] = " + (endTime - startTime));
  });

  return (
    <>
      <ThemeProvider>
        <For each={range}>
          {i => {
            return (
              <Box
                as="footer"
                color="white"
                bg="tomato"
                w="full"
                p="4"
                _hover={{
                  border: `4px solid`,
                  borderColor: "blue.500",
                  bg: "gray.600",
                  mx: 4,
                }}
                sx={{
                  borderColor: "red.900",
                  bg: "green.600",
                  mx: `${12 + i}px`,
                }}
              />
            );
          }}
        </For>
      </ThemeProvider>
    </>
  );
}

render(() => <App />, document.getElementById("root") as HTMLDivElement);
