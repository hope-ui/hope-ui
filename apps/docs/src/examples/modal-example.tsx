import {
  Button,
  HStack,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalDescription,
  ModalHeading,
  ModalOverlay,
  Text,
  VStack,
} from "@hope-ui/core";
import { createSignal } from "solid-js";

export function BasicUsageExample() {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal isOpen={isOpen()} onClose={() => setIsOpen(false)}>
        <ModalOverlay />
        <ModalContent p={4}>
          <HStack justifyContent="space-between" mb={4}>
            <ModalHeading fontWeight="semibold">Title</ModalHeading>
            <ModalCloseButton />
          </HStack>
          <p>The content of the Modal.</p>
        </ModalContent>
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
        <ModalOverlay />
        <ModalContent p={4}>
          <HStack justifyContent="space-between" mb={4}>
            <ModalHeading fontWeight="semibold">Title</ModalHeading>
            <ModalCloseButton />
          </HStack>
          <Text mb={4}>The content of the Modal.</Text>
          <HStack justifyContent="flex-end" spacing={4}>
            <Button data-autofocus _focus={{ color: "red" }}>
              Action
            </Button>
          </HStack>
        </ModalContent>
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
        <ModalOverlay />
        <ModalContent p={4}>
          <HStack justifyContent="space-between" mb={4}>
            <ModalHeading fontWeight="semibold">Title</ModalHeading>
            <ModalCloseButton />
          </HStack>
          <Text mb={4}>The content of the Modal.</Text>
          <HStack justifyContent="flex-end" spacing={4}>
            <Button id="initial-focus" _focus={{ color: "red" }}>
              Action
            </Button>
          </HStack>
        </ModalContent>
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
        <ModalOverlay />
        <ModalContent p={4}>
          <HStack justifyContent="space-between" mb={4}>
            <ModalHeading fontWeight="semibold">Title</ModalHeading>
            <ModalCloseButton />
          </HStack>
          <p>The content of the Modal.</p>
        </ModalContent>
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
        <ModalOverlay />
        <ModalContent p={4}>
          <HStack justifyContent="space-between" mb={4}>
            <ModalHeading fontWeight="semibold">Title</ModalHeading>
            <ModalCloseButton />
          </HStack>
          <p>The content of the Modal.</p>
        </ModalContent>
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
        <ModalOverlay />
        <ModalContent p={4}>
          <HStack justifyContent="space-between" mb={4}>
            <ModalHeading fontWeight="semibold">Title</ModalHeading>
            <ModalCloseButton />
          </HStack>
          <p>The content of the Modal.</p>
        </ModalContent>
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
        <ModalOverlay />
        <ModalContent p={4}>
          <HStack alignItems="flex-start" justifyContent="space-between" mb={4}>
            <VStack alignItems="flex-start">
              <ModalHeading fontWeight="semibold">Title</ModalHeading>
              <ModalDescription
                fontSize="sm"
                color={{ light: "neutral.600", dark: "neutral.300" }}
                mb={4}
              >
                Description
              </ModalDescription>
            </VStack>
            <ModalCloseButton />
          </HStack>
          <p>The content of the Modal.</p>
        </ModalContent>
      </Modal>
    </>
  );
}
