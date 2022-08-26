import { createDisclosure } from "@hope-ui/primitives";
import { Show } from "solid-js";

import { Button, FocusTrap, useColorMode } from "../src";

export default function App() {
  const { toggleColorMode } = useColorMode();

  const { isOpen, toggle, close } = createDisclosure();

  return (
    <>
      <Button onClick={toggle}>Open</Button>
      <Show when={isOpen()}>
        <FocusTrap restoreFocus p={4} border="1px solid tomato">
          <Button>Button 1</Button>
          <Button data-autofocus>Button 2</Button>
          <Button onClick={close}>Close</Button>
        </FocusTrap>
      </Show>
    </>
  );
}

/*
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
*/
