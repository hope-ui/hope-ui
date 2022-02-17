import "./playground.css";

import { createSignal } from "solid-js";
import { render } from "solid-js/web";

import {
  Box,
  Button,
  HopeProvider,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useColorMode,
} from ".";

export function App() {
  const { toggleColorMode } = useColorMode();
  const [isOpen, setIsOpen] = createSignal(false);

  const closeModal = () => setIsOpen(false);
  const openModal = () => setIsOpen(true);

  return (
    <Box p="$4">
      <Button onClick={openModal}>Open modal</Button>
      <Modal isOpen={isOpen()} onClose={closeModal} centered transition="scale">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Deactivate account</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to deactivate your account? All of your data will be permanently
            removed. This action cannot be undone.
          </ModalBody>
          <ModalFooter>
            <Button variant="default" mr="$4" onClick={toggleColorMode}>
              Cancel
            </Button>
            <Button colorScheme="danger" onClick={closeModal}>
              Deactivate
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

render(
  () => (
    <HopeProvider>
      <App />
    </HopeProvider>
  ),
  document.getElementById("root") as HTMLElement
);
