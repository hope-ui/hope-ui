import { createDisclosure } from "@hope-ui/primitives";

import { Box, Transition } from "../src";

function Foo(props: any) {
  console.log("rerender");
  return <Box {...props}></Box>;
}

export default function App() {
  const { isOpen, toggle } = createDisclosure();

  return (
    <>
      <button onClick={toggle}>toggle transition</button>
      <Transition mounted={isOpen()} transition="slide-right" duration={1000} timingFunction="ease">
        {styles => (
          <Foo style={styles} bg="neutral.900" color="neutral.50" h={10} w="40">
            Your modal
          </Foo>
        )}
      </Transition>
    </>
  );
}
