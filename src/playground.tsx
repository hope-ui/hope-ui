import "./playground.css";

import { createSignal } from "solid-js";
import { render } from "solid-js/web";

import {
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  HopeProvider,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Stack,
  Table,
  TableCaption,
  Tbody,
  Td,
  Tfoot,
  Th,
  Thead,
  Tr,
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
      <Spinner />
      <Spinner color="$danger9" />
      <Stack direction="row" columnGap="$4">
        <Spinner size="xs" />
        <Spinner size="sm" />
        <Spinner size="md" />
        <Spinner size="lg" />
        <Spinner size="xl" />
      </Stack>
      <Spinner thickness="4px" speed="0.65s" emptyColor="$neutral3" color="$info9" size="xl" />
      <VStack spacing="$10">
        <Divider />
        <Divider color="$primary9" />
        <Divider thickness="$12" />
      </VStack>
      <HStack height={50} justifyContent="space-between">
        <Divider orientation="vertical" color="$neutral12" />
        <Divider orientation="vertical" variant="dashed" color="$neutral12" />
        <Divider orientation="vertical" variant="dotted" color="$neutral12" />
      </HStack>
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
      <Table mb="$4" highlightOnHover>
        <TableCaption placement="top">Imperial to metric conversion factors</TableCaption>
        <Thead>
          <Tr>
            <Th>To convert</Th>
            <Th>into</Th>
            <Th numeric>multiply by</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>inches</Td>
            <Td>millimetres (mm)</Td>
            <Td numeric>25.4</Td>
          </Tr>
          <Tr>
            <Td>feet</Td>
            <Td>centimetres (cm)</Td>
            <Td numeric>30.48</Td>
          </Tr>
          <Tr>
            <Td>yards</Td>
            <Td>metres (m)</Td>
            <Td numeric>0.91444</Td>
          </Tr>
        </Tbody>
        <Tfoot>
          <Tr>
            <Th>To convert</Th>
            <Th>into</Th>
            <Th numeric>multiply by</Th>
          </Tr>
        </Tfoot>
      </Table>
      <Table striped="odd" highlightOnHover>
        <TableCaption>Imperial to metric conversion factors</TableCaption>
        <Thead>
          <Tr>
            <Th>To convert</Th>
            <Th>into</Th>
            <Th numeric>multiply by</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>inches</Td>
            <Td>millimetres (mm)</Td>
            <Td numeric>25.4</Td>
          </Tr>
          <Tr>
            <Td>feet</Td>
            <Td>centimetres (cm)</Td>
            <Td numeric>30.48</Td>
          </Tr>
          <Tr>
            <Td>yards</Td>
            <Td>metres (m)</Td>
            <Td numeric>0.91444</Td>
          </Tr>
        </Tbody>
        <Tfoot>
          <Tr>
            <Th>To convert</Th>
            <Th>into</Th>
            <Th numeric>multiply by</Th>
          </Tr>
        </Tfoot>
      </Table>
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
