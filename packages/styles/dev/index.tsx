import { For, render } from "solid-js/web";

import { Box, ThemeProvider } from "../src";

function App() {
  const startTime = new Date().getTime();

  return (
    <>
      <ThemeProvider>
        <For each={Array(1000).map((_, i) => i)}>
          {(_, i) => {
            if (i() === 999) {
              const endTime = new Date().getTime();
              console.log("duration [ms] = " + (endTime - startTime));
            }

            return (
              <Box
                as="footer"
                color="white"
                bg="tomato"
                w="full"
                p="4"
                _hover={theme => ({
                  border: `4px solid ${theme.colors.blue["500"]}`,
                  bg: "gray.600",
                  mx: 4,
                })}
                sx={{
                  borderColor: "red.900",
                  bg: "green.600",
                  mx: 12 + i() + "px",
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
