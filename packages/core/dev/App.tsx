import { createDisclosure } from "@hope-ui/primitives";

import { Transition } from "../src";

export default function App() {
  const { isOpen, toggle } = createDisclosure();

  return (
    <>
      <button onClick={toggle}>toggle</button>
      <Transition
        animate="rotate-right"
        duration={1000}
        exitDuration={2000}
        easing="ease-out"
        exitEasing="ease-in"
        delay={1000}
        isMounted={isOpen()}
        bg="tomato"
        color="white"
        p={4}
      >
        Lorem ipsum dolor sit amet.
      </Transition>
    </>
  );
}
