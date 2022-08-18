import { Button, hope } from "@hope-ui/core";
import { For } from "solid-js";
import { Title } from "solid-start";

const range = [...Array(3000).keys()];

export default function Home() {
  const startTime = new Date().getTime();

  return (
    <main>
      <Title>Hello World</Title>
      <h1>Hello world!</h1>

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
    </main>
  );
}
