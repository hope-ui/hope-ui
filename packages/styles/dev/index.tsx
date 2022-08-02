import { ParentProps } from "solid-js";
import { render } from "solid-js/web";

import { Box, createStyles, DefaultProps, ThemeProvider } from "../src";

const useButtonStyles = createStyles(() => ({
  root: {
    backgroundColor: "green.500",

    "&:hover": {
      backgroundColor: "green.600",
      color: "white",
    },
  },
  icon: {
    color: "zinc.500",
  },
}));

function Button(props: ParentProps<DefaultProps<"root" | "icon">>) {
  const classes = useButtonStyles(undefined, {
    name: "Button",
    styles: () => props.styles,
  });

  return (
    <Box {...props} class={classes().root}>
      <div class={classes().icon}>icon</div>
      {props.children}
    </Box>
  );
}

const range = [...Array(1500).keys()];

function App() {
  // const startTime = new Date().getTime();
  //
  // onMount(() => {
  //   const endTime = new Date().getTime();
  //   console.log(endTime);
  //   console.log(startTime);
  //
  //   console.log("duration [ms] = " + (endTime - startTime));
  // });

  return (
    <ThemeProvider
      theme={{
        components: {
          Button: {
            styles: {
              root: {
                backgroundColor: "red.500",

                "&:hover": {
                  color: "salmon",
                },
              },
            },
          },
        },
      }}
    >
      <Button
        styles={{
          root: {
            bgColor: "cyan.500",
          },
        }}
        p={4}
      >
        Button
      </Button>
    </ThemeProvider>
  );
}

render(() => <App />, document.getElementById("root") as HTMLDivElement);

/*
<For each={range}>
        {(_, i) => (
          <Box
            boxSize="100px"
            w={`${i()}px`}
            borderWidth="3px"
            bg={["green.500", "zinc.500", "slate.100"]}
            borderStyle={["dashed", "solid", "dotted"]}
            _hover={{
              bg: ["green.700", "zinc.700", "slate.300"],
            }}
            sx={{
              p: [4, 6, 8, 12, 16, 24],
            }}
          >
            test case
          </Box>
        )}
      </For>
*/
