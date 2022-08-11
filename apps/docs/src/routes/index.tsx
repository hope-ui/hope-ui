import { Button } from "@hope-ui/core";
import { onMount } from "solid-js";
import { For } from "solid-js/web";
import { Title } from "solid-start";

const range = [...Array(3000).keys()];

export default function Home() {
  const startTime = new Date().getTime();

  onMount(() => {
    const endTime = new Date().getTime();
    console.log(endTime);
    console.log(startTime);

    console.log("duration [ms] = " + (endTime - startTime));
  });

  return (
    <main>
      <Title>Hello World</Title>
      <h1>Hello world!</h1>
      <For each={range}>{(_, i) => <Button>Button</Button>}</For>
    </main>
  );
}
