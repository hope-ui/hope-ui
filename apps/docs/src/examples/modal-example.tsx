import { Button, HStack, Modal, ModalProps, Text, VStack } from "@hope-ui/core";
import { createSignal, For, Show } from "solid-js";

export function BasicUsageExample() {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal isOpen={isOpen()} onClose={() => setIsOpen(false)}>
        <Modal.Overlay />
        <Modal.Content p={4}>
          <HStack justifyContent="space-between" mb={4}>
            <Modal.Heading fontWeight="semibold">Title</Modal.Heading>
            <Modal.CloseButton />
          </HStack>
          <p>The content of the Modal.</p>
        </Modal.Content>
      </Modal>
    </>
  );
}

export function InitialFocusExample() {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal isOpen={isOpen()} onClose={() => setIsOpen(false)}>
        <Modal.Overlay />
        <Modal.Content p={4}>
          <HStack justifyContent="space-between" mb={4}>
            <Modal.Heading fontWeight="semibold">Title</Modal.Heading>
            <Modal.CloseButton />
          </HStack>
          <Text mb={4}>The content of the Modal.</Text>
          <HStack justifyContent="flex-end" spacing={4}>
            <Button data-autofocus _focus={{ color: "red" }}>
              Action
            </Button>
          </HStack>
        </Modal.Content>
      </Modal>
    </>
  );
}

export function CustomInitialFocusExample() {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal
        isOpen={isOpen()}
        onClose={() => setIsOpen(false)}
        initialFocusSelector="#initial-focus"
      >
        <Modal.Overlay />
        <Modal.Content p={4}>
          <HStack justifyContent="space-between" mb={4}>
            <Modal.Heading fontWeight="semibold">Title</Modal.Heading>
            <Modal.CloseButton />
          </HStack>
          <Text mb={4}>The content of the Modal.</Text>
          <HStack justifyContent="flex-end" spacing={4}>
            <Button id="initial-focus" _focus={{ color: "red" }}>
              Action
            </Button>
          </HStack>
        </Modal.Content>
      </Modal>
    </>
  );
}

export function CustomRestoreFocusExample() {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <HStack spacing={4}>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal
        isOpen={isOpen()}
        onClose={() => setIsOpen(false)}
        restoreFocusSelector="[data-finalfocus]"
      >
        <Modal.Overlay />
        <Modal.Content p={4}>
          <HStack justifyContent="space-between" mb={4}>
            <Modal.Heading fontWeight="semibold">Title</Modal.Heading>
            <Modal.CloseButton />
          </HStack>
          <p>The content of the Modal.</p>
        </Modal.Content>
      </Modal>

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
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal isOpen={isOpen()} onClose={() => setIsOpen(false)} trapFocus={false}>
        <Modal.Overlay />
        <Modal.Content p={4}>
          <HStack justifyContent="space-between" mb={4}>
            <Modal.Heading fontWeight="semibold">Title</Modal.Heading>
            <Modal.CloseButton />
          </HStack>
          <p>The content of the Modal.</p>
        </Modal.Content>
      </Modal>
    </>
  );
}

export function DisablePreventScrollExample() {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal isOpen={isOpen()} onClose={() => setIsOpen(false)} preventScroll={false}>
        <Modal.Overlay />
        <Modal.Content p={4}>
          <HStack justifyContent="space-between" mb={4}>
            <Modal.Heading fontWeight="semibold">Title</Modal.Heading>
            <Modal.CloseButton />
          </HStack>
          <p>The content of the Modal.</p>
        </Modal.Content>
      </Modal>
    </>
  );
}

export function HeadingAndDescriptionExample() {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal isOpen={isOpen()} onClose={() => setIsOpen(false)}>
        <Modal.Overlay />
        <Modal.Content p={4}>
          <HStack alignItems="flex-start" justifyContent="space-between" mb={4}>
            <VStack alignItems="flex-start">
              <Modal.Heading fontWeight="semibold">Title</Modal.Heading>
              <Modal.Description
                fontSize="sm"
                color={{ light: "neutral.600", dark: "neutral.300" }}
                mb={4}
              >
                Description
              </Modal.Description>
            </VStack>
            <Modal.CloseButton />
          </HStack>
          <p>The content of the Modal.</p>
        </Modal.Content>
      </Modal>
    </>
  );
}

export function TransitionExample() {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal
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
        <Modal.Overlay />
        <Modal.Content p={4}>
          <HStack justifyContent="space-between" mb={4}>
            <Modal.Heading fontWeight="semibold">Title</Modal.Heading>
            <Modal.CloseButton />
          </HStack>
          <p>The content of the Modal.</p>
        </Modal.Content>
      </Modal>
    </>
  );
}

export function VerticallyCenteredExample() {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal isOpen={isOpen()} onClose={() => setIsOpen(false)} isCentered>
        <Modal.Overlay />
        <Modal.Content p={4}>
          <HStack justifyContent="space-between" mb={4}>
            <Modal.Heading fontWeight="semibold">Title</Modal.Heading>
            <Modal.CloseButton />
          </HStack>
          <p>The content of the Modal.</p>
        </Modal.Content>
      </Modal>
    </>
  );
}

export function SizeExample() {
  const [size, setSize] = createSignal<ModalProps["size"]>("md");
  const [isOpen, setIsOpen] = createSignal(false);

  const handleClick = (newSize: ModalProps["size"]) => {
    setSize(newSize);
    setIsOpen(true);
  };

  const sizes: Array<ModalProps["size"]> = ["xs", "sm", "md", "lg", "xl", "full"];

  return (
    <>
      <HStack spacing={4}>
        <For each={sizes}>{size => <Button onClick={() => handleClick(size)}>{size}</Button>}</For>
      </HStack>

      <Modal isOpen={isOpen()} onClose={() => setIsOpen(false)} size={size()}>
        <Show when={size() !== "full"}>
          <Modal.Overlay />
        </Show>
        <Modal.Content p={4}>
          <HStack justifyContent="space-between" mb={4}>
            <Modal.Heading fontWeight="semibold">Title</Modal.Heading>
            <Modal.CloseButton />
          </HStack>
          <p>The content of the Modal.</p>
        </Modal.Content>
      </Modal>
    </>
  );
}

export function CustomBackdropExample() {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal isOpen={isOpen()} onClose={() => setIsOpen(false)}>
        <Modal.Overlay
          sx={{
            bg: "blackAlpha.300",
            backdropFilter: "blur(10px) hue-rotate(90deg)",
          }}
        />
        <Modal.Content p={4}>
          <HStack justifyContent="space-between" mb={4}>
            <Modal.Heading fontWeight="semibold">Title</Modal.Heading>
            <Modal.CloseButton />
          </HStack>
          <p>The content of the Modal.</p>
        </Modal.Content>
      </Modal>
    </>
  );
}

export function ScrollBehaviorExample() {
  const [scrollBehavior, setScrollBehavior] = createSignal<ModalProps["scrollBehavior"]>("outside");
  const [isOpen, setIsOpen] = createSignal(false);

  const handleClick = (newValue: ModalProps["scrollBehavior"]) => {
    setScrollBehavior(newValue);
    setIsOpen(true);
  };

  const scrollBehaviors: Array<ModalProps["scrollBehavior"]> = ["outside", "inside"];

  return (
    <>
      <HStack spacing={4}>
        <For each={scrollBehaviors}>
          {scrollBehavior => (
            <Button onClick={() => handleClick(scrollBehavior)}>{scrollBehavior} overflow</Button>
          )}
        </For>
      </HStack>

      <Modal isOpen={isOpen()} onClose={() => setIsOpen(false)} scrollBehavior={scrollBehavior()}>
        <Modal.Overlay />
        <Modal.Content p={4}>
          <HStack justifyContent="space-between" mb={4}>
            <Modal.Heading fontWeight="semibold">Title</Modal.Heading>
            <Modal.CloseButton />
          </HStack>
          <For each={Array(100).fill("")}>{() => <p>The content of the Modal.</p>}</For>
        </Modal.Content>
      </Modal>
    </>
  );
}
