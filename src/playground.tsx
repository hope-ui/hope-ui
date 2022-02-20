import "./playground.css";

import { createSignal } from "solid-js";
import { render } from "solid-js/web";

import {
  Box,
  Breadcrumb,
  BreadcrumbLink,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  HopeProvider,
  IconChevronRight,
  IconInfoCircleSolid,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useColorMode,
  VStack,
} from ".";

export function App() {
  const { toggleColorMode } = useColorMode();
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const closeModal = () => setIsModalOpen(false);
  const openModal = () => setIsModalOpen(true);

  const [isDrawerOpen, setIsDrawerOpen] = createSignal(false);
  const closeDrawer = () => setIsDrawerOpen(false);
  const openDrawer = () => setIsDrawerOpen(true);

  return (
    <Box p="$4">
      <VStack alignItems="flex-start" spacing="$6">
        <Breadcrumb>
          <BreadcrumbLink href="#">Home</BreadcrumbLink>
        </Breadcrumb>
        <Breadcrumb>
          <BreadcrumbLink href="#">Home</BreadcrumbLink>
          <BreadcrumbLink href="#">About</BreadcrumbLink>
          <BreadcrumbLink href="#" currentPage>
            Contact
          </BreadcrumbLink>
        </Breadcrumb>
        <Breadcrumb separator="-" fontSize={30}>
          <BreadcrumbLink href="#">
            <IconInfoCircleSolid />
          </BreadcrumbLink>
          <BreadcrumbLink href="#">About</BreadcrumbLink>
          <BreadcrumbLink href="#" currentPage>
            Contact
          </BreadcrumbLink>
        </Breadcrumb>
        <Breadcrumb spacing="4px" separator={<IconChevronRight />}>
          <BreadcrumbLink href="#">
            <IconInfoCircleSolid />
            Home
          </BreadcrumbLink>
          <BreadcrumbLink href="#">About</BreadcrumbLink>
          <BreadcrumbLink href="#" currentPage>
            Contact
          </BreadcrumbLink>
        </Breadcrumb>

        <Button onClick={openModal}>Open modal</Button>
        <Modal isOpen={isModalOpen()} onClose={closeModal}>
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
        <Button onClick={openDrawer}>Open drawer</Button>
        <Drawer isOpen={isDrawerOpen()} onClose={closeDrawer}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerHeader>Deactivate account</DrawerHeader>
            <DrawerCloseButton />
            <DrawerBody>
              Are you sure you want to deactivate your account? All of your data will be permanently
              removed. This action cannot be undone.
            </DrawerBody>
            <DrawerFooter>
              <Button variant="default" mr="$4" onClick={toggleColorMode}>
                Cancel
              </Button>
              <Button colorScheme="danger" onClick={closeDrawer}>
                Deactivate
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </VStack>
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
