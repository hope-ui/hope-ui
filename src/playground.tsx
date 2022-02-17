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

  return (
    <Box p="$4">
      <Button onClick={() => setIsOpen(true)}>Open modal</Button>
      <Modal isOpen={isOpen()} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modal Title</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quia quaerat, ratione laborum
            placeat voluptatum, facere quod dolor officia impedit minima praesentium necessitatibus
            quae in illum tempore sed voluptatibus pariatur omnis reiciendis rem natus. Odio
            laudantium tenetur quibusdam laboriosam enim maiores reprehenderit voluptate impedit
            sint nostrum doloribus perspiciatis fuga id, vitae quas odit nihil praesentium itaque
            quia neque ab ut excepturi facilis error. Aspernatur quae soluta aut, consectetur, cum
            consequuntur voluptatem culpa aliquam earum obcaecati quis assumenda quos, dignissimos
            recusandae nam unde commodi sint eius. Obcaecati placeat eveniet reprehenderit repellat
            enim assumenda odit ipsa veniam consequuntur corrupti illo voluptas, aliquid debitis ea
            quae, qui minima. Omnis recusandae quae distinctio, atque laborum repudiandae ipsam
            possimus repellat labore, sunt illo esse consequuntur quas! Doloremque, explicabo
            voluptates sit voluptatem autem reiciendis nobis ut laborum? Porro quasi adipisci,
            provident enim rerum optio odio quibusdam iure. Animi praesentium voluptatum, dolorum
            sequi aperiam quis! Voluptates laudantium repellat repellendus aperiam, fugit in quod
            ratione, iusto ipsam, facere labore. Dolorem ab voluptas earum dolor ut aspernatur
            fugiat, odit modi, ipsam eligendi illo inventore deserunt accusamus consectetur nobis
            exercitationem nisi nemo dolore cum? Autem libero facere sapiente architecto enim nihil?
            Laborum molestiae deserunt iure minus ipsum excepturi possimus doloremque magni suscipit
            quibusdam iste fugit nostrum facilis enim quaerat neque placeat, aperiam inventore odit
            provident asperiores veritatis dolorum? Voluptate officiis quisquam ipsum obcaecati,
            quae fugit quo dolorem consequuntur autem et ab sit ad perspiciatis ea, nemo alias
          </ModalBody>
          <ModalFooter>
            <Button mr="$4" onClick={closeModal}>
              Close
            </Button>
            <Button variant="ghost" onClick={toggleColorMode}>
              Toggle Color mode
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
