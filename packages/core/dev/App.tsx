import { Box, Popover, PopoverContent } from "../src";
import { createSignal } from "solid-js";

export default function App() {
  const [anchorRect, setAnchorRect] = createSignal({ x: 0, y: 0 });
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "0.5rem",
          borderWidth: "2px",
          borderStyle: "dashed",
          borderColor: "hsl(204 20% 88%)",
          paddingTop: "2.5rem",
          paddingBottom: "2.5rem",
          paddingLeft: "4rem",
          paddingRight: "4rem",
        }}
        onContextMenu={event => {
          event.preventDefault();
          setAnchorRect({ x: event.clientX, y: event.clientY });
          setIsOpen(true);
        }}
      >
        Right click here
      </Box>
      <Popover
        isOpen={isOpen()}
        onOpenChange={setIsOpen}
        getAnchorRect={anchorRect}
        closeOnBlur={false}
      >
        <PopoverContent w="max-content" p={4}>
          <p>The content of the Popover.</p>
        </PopoverContent>
      </Popover>
    </>
  );
}
