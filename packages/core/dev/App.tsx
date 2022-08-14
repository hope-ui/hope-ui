import { Button } from "../src";

export default function App() {
  return (
    <>
      <Button styleConfig={{}}></Button>
    </>
  );
}

/*
import { For } from "solid-js/web";
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
