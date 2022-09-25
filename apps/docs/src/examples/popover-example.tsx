import {
  Button,
  HStack,
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@hope-ui/core";
import { createSignal } from "solid-js";

import { TargetIcon } from "../components/icons";

export function RenderPropPopoverExample() {
  return (
    <Popover>
      {({ isOpen, close }) => (
        <>
          <PopoverTrigger as={Button}>Click to {isOpen() ? "close" : "open"}</PopoverTrigger>
          <PopoverContent w="max-content" p={4}>
            <p>The content of the Popover.</p>
            <Button onClick={close}>Close</Button>
          </PopoverContent>
        </>
      )}
    </Popover>
  );
}

export function ControlledPopoverExample() {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <HStack spacing={4}>
      <Button onClick={() => setIsOpen(prev => !prev)}>
        Click to {isOpen() ? "close" : "open"}
      </Button>

      <Popover isOpen={isOpen()} onOpenChange={setIsOpen} closeOnBlur={false}>
        <PopoverAnchor as={TargetIcon} boxSize={6} />
        <PopoverContent w="max-content" p={4}>
          <p>The content of the Popover.</p>
        </PopoverContent>
      </Popover>
    </HStack>
  );
}
