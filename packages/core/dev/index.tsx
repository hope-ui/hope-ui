import { onMount } from "solid-js";
import { For, render } from "solid-js/web";

import { Button, extendTheme, HopeProvider, useColorMode, useTheme } from "../src";

const range = [...Array(3000).keys()];

function Foo() {
  const { toggleColorMode } = useColorMode();

  const theme = useTheme();

  console.log(theme.__cssVarsValues);
  console.log(theme.vars);

  return <Button onClick={toggleColorMode}>Button</Button>;
}

const theme = extendTheme({});

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
