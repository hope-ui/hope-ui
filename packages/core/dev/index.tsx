import { onMount } from "solid-js";
import { For, render } from "solid-js/web";

import { Button, extendTheme, HopeProvider, useColorMode, useTheme } from "../src";
import { ButtonTheme } from "../src/button/types";

const range = [...Array(3000).keys()];

function Foo() {
  const { toggleColorMode } = useColorMode();

  const theme = useTheme();

  //console.log(theme.__cssVarsValues);
  //console.log(theme.vars);

  return <Button onClick={toggleColorMode}>Button</Button>;
}

const theme = extendTheme({
  cssVarPrefix: "chien",
  colors: {
    light: {
      primary: {
        outlinedBackground: "red",
        outlinedHoverBorder: "green",
      },
    },
  },
  components: {
    Button: {
      styles: (vars, params) => ({
        base: {
          root: {
            rounded: "full",
          },
        },
        variants: {
          variant: {
            outlined: {
              root: {
                background: vars.colors[params.colorScheme]["900"],
              },
            },
          },
        },
      }),
    } as ButtonTheme,
  },
});

function App() {
  const startTime = new Date().getTime();

  onMount(() => {
    const endTime = new Date().getTime();
    console.log(endTime);
    console.log(startTime);

    console.log("duration [ms] = " + (endTime - startTime));
  });

  return (
    <HopeProvider withGlobalStyles theme={theme}>
      <Foo />
      <For each={range}>{(_, i) => <Button>Button</Button>}</For>
    </HopeProvider>
  );
}

render(() => <App />, document.getElementById("root") as HTMLDivElement);
