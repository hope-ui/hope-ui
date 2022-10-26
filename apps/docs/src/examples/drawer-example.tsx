import { Button, Drawer, DrawerProps, HStack, Text, VStack } from "@hope-ui/core";
import { createSignal, For, Show } from "solid-js";

export function BasicUsageExample() {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Drawer</Button>
      <Drawer isOpen={isOpen()} onClose={() => setIsOpen(false)}>
        <Drawer.Overlay />
        <Drawer.Content p={4}>
          <HStack justifyContent="space-between" mb={4}>
            <Drawer.Heading fontWeight="semibold">Title</Drawer.Heading>
            <Drawer.CloseButton />
          </HStack>
          <p>The content of the Drawer.</p>
        </Drawer.Content>
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
        <Drawer.Overlay />
        <Drawer.Content p={4}>
          <HStack justifyContent="space-between" mb={4}>
            <Drawer.Heading fontWeight="semibold">Title</Drawer.Heading>
            <Drawer.CloseButton />
          </HStack>
          <Text mb={4}>The content of the Drawer.</Text>
          <HStack justifyContent="flex-end" spacing={4}>
            <Button data-autofocus _focus={{ color: "red" }}>
              Action
            </Button>
          </HStack>
        </Drawer.Content>
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
        <Drawer.Overlay />
        <Drawer.Content p={4}>
          <HStack justifyContent="space-between" mb={4}>
            <Drawer.Heading fontWeight="semibold">Title</Drawer.Heading>
            <Drawer.CloseButton />
          </HStack>
          <Text mb={4}>The content of the Drawer.</Text>
          <HStack justifyContent="flex-end" spacing={4}>
            <Button id="initial-focus" _focus={{ color: "red" }}>
              Action
            </Button>
          </HStack>
        </Drawer.Content>
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
        <Drawer.Overlay />
        <Drawer.Content p={4}>
          <HStack justifyContent="space-between" mb={4}>
            <Drawer.Heading fontWeight="semibold">Title</Drawer.Heading>
            <Drawer.CloseButton />
          </HStack>
          <p>The content of the Drawer.</p>
        </Drawer.Content>
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
        <Drawer.Overlay />
        <Drawer.Content p={4}>
          <HStack justifyContent="space-between" mb={4}>
            <Drawer.Heading fontWeight="semibold">Title</Drawer.Heading>
            <Drawer.CloseButton />
          </HStack>
          <p>The content of the Drawer.</p>
        </Drawer.Content>
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
        <Drawer.Overlay />
        <Drawer.Content p={4}>
          <HStack justifyContent="space-between" mb={4}>
            <Drawer.Heading fontWeight="semibold">Title</Drawer.Heading>
            <Drawer.CloseButton />
          </HStack>
          <p>The content of the Drawer.</p>
        </Drawer.Content>
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
        <Drawer.Overlay />
        <Drawer.Content p={4}>
          <HStack alignItems="flex-start" justifyContent="space-between" mb={4}>
            <VStack alignItems="flex-start">
              <Drawer.Heading fontWeight="semibold">Title</Drawer.Heading>
              <Drawer.Description
                fontSize="sm"
                color={{ light: "neutral.600", dark: "neutral.300" }}
                mb={4}
              >
                Description
              </Drawer.Description>
            </VStack>
            <Drawer.CloseButton />
          </HStack>
          <p>The content of the Drawer.</p>
        </Drawer.Content>
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
        <Drawer.Overlay />
        <Drawer.Content p={4}>
          <HStack justifyContent="space-between" mb={4}>
            <Drawer.Heading fontWeight="semibold">Title</Drawer.Heading>
            <Drawer.CloseButton />
          </HStack>
          <p>The content of the Drawer.</p>
        </Drawer.Content>
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
        <Drawer.Overlay />
        <Drawer.Content p={4}>
          <HStack justifyContent="space-between" mb={4}>
            <Drawer.Heading fontWeight="semibold">Title</Drawer.Heading>
            <Drawer.CloseButton />
          </HStack>
          <p>The content of the Drawer.</p>
        </Drawer.Content>
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
          <Drawer.Overlay />
        </Show>
        <Drawer.Content p={4}>
          <HStack justifyContent="space-between" mb={4}>
            <Drawer.Heading fontWeight="semibold">Title</Drawer.Heading>
            <Drawer.CloseButton />
          </HStack>
          <p>The content of the Drawer.</p>
        </Drawer.Content>
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
        <Drawer.Overlay
          sx={{
            bg: "blackAlpha.300",
            backdropFilter: "blur(10px) hue-rotate(90deg)",
          }}
        />
        <Drawer.Content p={4}>
          <HStack justifyContent="space-between" mb={4}>
            <Drawer.Heading fontWeight="semibold">Title</Drawer.Heading>
            <Drawer.CloseButton />
          </HStack>
          <p>The content of the Drawer.</p>
        </Drawer.Content>
      </Drawer>
    </>
  );
}
