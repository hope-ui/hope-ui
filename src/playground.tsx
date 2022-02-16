import "./playground.css";

import { createSignal } from "solid-js";
import { render } from "solid-js/web";

import { Box, Button, HopeProvider, Modal, ModalContent, ModalOverlay } from ".";

export function App() {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <Box p="$4">
      <Button onClick={() => setIsOpen(true)}>Open modal</Button>
      <Modal isOpen={isOpen()} onClose={() => setIsOpen(false)} initialFocus="[data-autofocus]">
        <ModalOverlay />
        <ModalContent p="$4">
          <p>
            Molestiae quia quod veritatis explicabo eveniet iusto dicta quaerat laudantium fugit
            reiciendis iure quos adipisci qui exercitationem ipsa numquam pariatur provident sunt
            illo aut, sit nulla sapiente incidunt? Ipsum reprehenderit, possimus animi aperiam, ad
            minima nostrum error quis illum provident obcaecati delectus dolores in eaque nam
            commodi! Ratione!
          </p>
          <button data-autofocus>Hi mom</button>
          <Button>Close</Button>
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
