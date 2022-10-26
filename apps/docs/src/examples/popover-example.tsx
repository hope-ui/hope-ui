import { Button, Center, createInteractOutside, HStack, Popover } from "@hope-ui/core";
import { createSignal } from "solid-js";

import { TargetIcon } from "../components/icons";

export function FollowCursorExample() {
  const [anchorRect, setAnchorRect] = createSignal({ x: 0, y: 0 });
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <>
      <Center
        height="100px"
        rounded="sm"
        borderWidth="2px"
        borderStyle="dashed"
        borderColor="neutral.300"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onMouseMove={event => {
          event.preventDefault();
          setAnchorRect({ x: event.clientX, y: event.clientY });
        }}
      >
        Hover the area.
      </Center>
      <Popover isOpen={isOpen()} onOpenChange={setIsOpen} getAnchorRect={anchorRect}>
        <Popover.Content w="max-content" p={4}>
          <p>The content of the Popover.</p>
        </Popover.Content>
      </Popover>
    </>
  );
}

export function RightClickExample() {
  let containerRef: HTMLDivElement | undefined;

  const [anchorRect, setAnchorRect] = createSignal({ x: 0, y: 0 });
  const [isOpen, setIsOpen] = createSignal(false);

  createInteractOutside(
    {
      onInteractOutside: () => setIsOpen(false),
    },
    () => containerRef
  );

  return (
    <>
      <Center
        ref={containerRef}
        height="100px"
        rounded="sm"
        borderWidth="2px"
        borderStyle="dashed"
        borderColor="neutral.300"
        onContextMenu={event => {
          event.preventDefault();
          setAnchorRect({ x: event.clientX, y: event.clientY });
          setIsOpen(true);
        }}
      >
        Right click in the area.
      </Center>
      <Popover isOpen={isOpen()} onOpenChange={setIsOpen} getAnchorRect={anchorRect}>
        <Popover.Content w="max-content" p={4}>
          <p>The content of the Popover.</p>
        </Popover.Content>
      </Popover>
    </>
  );
}

export function RenderPropPopoverExample() {
  return (
    <Popover>
      {({ isOpen, close }) => (
        <>
          <Popover.Trigger as={Button}>Click to {isOpen() ? "close" : "open"}</Popover.Trigger>
          <Popover.Content w="max-content" p={4}>
            <p>The content of the Popover.</p>
            <Button onClick={close}>Close</Button>
          </Popover.Content>
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
        <Popover.Anchor as={TargetIcon} boxSize={6} />
        <Popover.Content w="max-content" p={4}>
          <p>The content of the Popover.</p>
        </Popover.Content>
      </Popover>
    </HStack>
  );
}
