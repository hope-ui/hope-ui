import { For } from "solid-js";

import { Button, hope } from "../src";

const range = [...Array(3000).keys()];

export default function App() {
  const startTime = new Date().getTime();

  return (
    <>
      <For each={range}>{(_, i) => <Button>Button</Button>}</For>
      <hope.div
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          bg: "tomato",
          color: "white",
          p: 4,
        }}
      >
        {new Date().getTime() - startTime}
      </hope.div>
    </>
  );
}

/*
import { For, onMount } from "solid-js";

import { Button } from "../src";

const range = [...Array(3000).keys()];

export default function App() {
  const startTime = new Date().getTime();

  onMount(() => {
    const endTime = new Date().getTime();
    console.log(endTime - startTime);
  });

  return <For each={range}>{(_, i) => <Button>Button</Button>}</For>;
}
*/
