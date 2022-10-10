import {
  Button,
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerDescription,
  DrawerHeading,
  DrawerOverlay,
  DrawerProps,
  HStack,
  Text,
  VStack,
} from "@hope-ui/core";
import { createSignal, For, Show } from "solid-js";

export function BasicUsageExample() {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Drawer</Button>
      <Drawer isOpen={isOpen()} onClose={() => setIsOpen(false)}>
        <DrawerOverlay />
        <DrawerContent p={4}>
          <HStack justifyContent="space-between" mb={4}>
            <DrawerHeading fontWeight="semibold">Title</DrawerHeading>
            <DrawerCloseButton />
          </HStack>
          <p>The content of the Drawer.</p>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export function InitialFocusExample() {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Drawer</Button>
      <Drawer isOpen={isOpen()} onClose={() => setIsOpen(false)}>
        <DrawerOverlay />
        <DrawerContent p={4}>
          <HStack justifyContent="space-between" mb={4}>
            <DrawerHeading fontWeight="semibold">Title</DrawerHeading>
            <DrawerCloseButton />
          </HStack>
          <Text mb={4}>The content of the Drawer.</Text>
          <HStack justifyContent="flex-end" spacing={4}>
            <Button data-autofocus _focus={{ color: "red" }}>
              Action
            </Button>
          </HStack>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export function CustomInitialFocusExample() {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Drawer</Button>
      <Drawer
        isOpen={isOpen()}
        onClose={() => setIsOpen(false)}
        initialFocusSelector="#initial-focus"
      >
        <DrawerOverlay />
        <DrawerContent p={4}>
          <HStack justifyContent="space-between" mb={4}>
            <DrawerHeading fontWeight="semibold">Title</DrawerHeading>
            <DrawerCloseButton />
          </HStack>
          <Text mb={4}>The content of the Drawer.</Text>
          <HStack justifyContent="flex-end" spacing={4}>
            <Button id="initial-focus" _focus={{ color: "red" }}>
              Action
            </Button>
          </HStack>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export function CustomRestoreFocusExample() {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <HStack spacing={4}>
      <Button onClick={() => setIsOpen(true)}>Open Drawer</Button>
      <Drawer
        isOpen={isOpen()}
        onClose={() => setIsOpen(false)}
        restoreFocusSelector="[data-finalfocus]"
      >
        <DrawerOverlay />
        <DrawerContent p={4}>
          <HStack justifyContent="space-between" mb={4}>
            <DrawerHeading fontWeight="semibold">Title</DrawerHeading>
            <DrawerCloseButton />
          </HStack>
          <p>The content of the Drawer.</p>
        </DrawerContent>
      </Drawer>

      <Button data-finalfocus _focus={{ color: "red" }}>
        Final focus element
      </Button>
    </HStack>
  );
}

export function DisableFocusTrapExample() {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Drawer</Button>
      <Drawer isOpen={isOpen()} onClose={() => setIsOpen(false)} trapFocus={false}>
        <DrawerOverlay />
        <DrawerContent p={4}>
          <HStack justifyContent="space-between" mb={4}>
            <DrawerHeading fontWeight="semibold">Title</DrawerHeading>
            <DrawerCloseButton />
          </HStack>
          <p>The content of the Drawer.</p>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export function DisablePreventScrollExample() {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Drawer</Button>
      <Drawer isOpen={isOpen()} onClose={() => setIsOpen(false)} preventScroll={false}>
        <DrawerOverlay />
        <DrawerContent p={4}>
          <HStack justifyContent="space-between" mb={4}>
            <DrawerHeading fontWeight="semibold">Title</DrawerHeading>
            <DrawerCloseButton />
          </HStack>
          <p>The content of the Drawer.</p>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export function HeadingAndDescriptionExample() {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Drawer</Button>
      <Drawer isOpen={isOpen()} onClose={() => setIsOpen(false)}>
        <DrawerOverlay />
        <DrawerContent p={4}>
          <HStack alignItems="flex-start" justifyContent="space-between" mb={4}>
            <VStack alignItems="flex-start">
              <DrawerHeading fontWeight="semibold">Title</DrawerHeading>
              <DrawerDescription
                fontSize="sm"
                color={{ light: "neutral.600", dark: "neutral.300" }}
                mb={4}
              >
                Description
              </DrawerDescription>
            </VStack>
            <DrawerCloseButton />
          </HStack>
          <p>The content of the Drawer.</p>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export function TransitionExample() {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Drawer</Button>
      <Drawer
        isOpen={isOpen()}
        onClose={() => setIsOpen(false)}
        contentTransitionOptions={{
          transition: "slide-up",
          duration: 400,
          exitDuration: 250,
          easing: "ease-out",
          exitEasing: "ease-in",
        }}
      >
        <DrawerOverlay />
        <DrawerContent p={4}>
          <HStack justifyContent="space-between" mb={4}>
            <DrawerHeading fontWeight="semibold">Title</DrawerHeading>
            <DrawerCloseButton />
          </HStack>
          <p>The content of the Drawer.</p>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export function PlacementExample() {
  const [placement, setPlacement] = createSignal<DrawerProps["placement"]>("right");
  const [isOpen, setIsOpen] = createSignal(false);

  const handleClick = (newPlacement: DrawerProps["placement"]) => {
    setPlacement(newPlacement);
    setIsOpen(true);
  };

  const placements: Array<DrawerProps["placement"]> = ["top", "right", "bottom", "left"];

  return (
    <>
      <HStack spacing={4}>
        <For each={placements}>
          {placement => <Button onClick={() => handleClick(placement)}>{placement}</Button>}
        </For>
      </HStack>

      <Drawer isOpen={isOpen()} onClose={() => setIsOpen(false)} placement={placement()}>
        <DrawerOverlay />
        <DrawerContent p={4}>
          <HStack justifyContent="space-between" mb={4}>
            <DrawerHeading fontWeight="semibold">Title</DrawerHeading>
            <DrawerCloseButton />
          </HStack>
          <p>The content of the Drawer.</p>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export function SizeExample() {
  const [size, setSize] = createSignal<DrawerProps["size"]>("md");
  const [isOpen, setIsOpen] = createSignal(false);

  const handleClick = (newSize: DrawerProps["size"]) => {
    setSize(newSize);
    setIsOpen(true);
  };

  const sizes: Array<DrawerProps["size"]> = ["xs", "sm", "md", "lg", "xl", "full"];

  return (
    <>
      <HStack spacing={4}>
        <For each={sizes}>{size => <Button onClick={() => handleClick(size)}>{size}</Button>}</For>
      </HStack>

      <Drawer isOpen={isOpen()} onClose={() => setIsOpen(false)} size={size()}>
        <Show when={size() !== "full"}>
          <DrawerOverlay />
        </Show>
        <DrawerContent p={4}>
          <HStack justifyContent="space-between" mb={4}>
            <DrawerHeading fontWeight="semibold">Title</DrawerHeading>
            <DrawerCloseButton />
          </HStack>
          <p>The content of the Drawer.</p>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export function CustomBackdropExample() {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Drawer</Button>
      <Drawer isOpen={isOpen()} onClose={() => setIsOpen(false)}>
        <DrawerOverlay
          sx={{
            bg: "blackAlpha.300",
            backdropFilter: "blur(10px) hue-rotate(90deg)",
          }}
        />
        <DrawerContent p={4}>
          <HStack justifyContent="space-between" mb={4}>
            <DrawerHeading fontWeight="semibold">Title</DrawerHeading>
            <DrawerCloseButton />
          </HStack>
          <p>The content of the Drawer.</p>
        </DrawerContent>
      </Drawer>
    </>
  );
}
