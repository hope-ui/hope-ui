import { createDisclosure } from "@hope-ui/primitives";

import { Button, Popover, PopoverContent, PopoverTrigger } from "../src";

export default function App() {
  const { isOpen, toggle } = createDisclosure();

  return (
    <>
      <button onClick={toggle}>toggle</button>
      <Popover>
        <PopoverTrigger as={Button}>Trigger</PopoverTrigger>
        <PopoverContent p={4}>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Animi commodi cupiditate fugit
            libero reiciendis unde, vero voluptates. Et, obcaecati officiis.
          </p>
        </PopoverContent>
      </Popover>
    </>
  );
}
