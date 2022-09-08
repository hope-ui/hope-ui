import { Box, Button, useColorMode, useColorModeValue } from "@hope-ui/core";

export function UseColorModeExample() {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Button onClick={toggleColorMode}>
      Toggle {colorMode() === "light" ? "dark" : "light"} mode
    </Button>
  );
}

export function UseColorModeValueExample() {
  const { toggleColorMode } = useColorMode();

  const bg = useColorModeValue("tomato", "royalblue");
  const color = useColorModeValue("black", "white");

  return (
    <>
      <Box mb={4} p={2} bg={bg()} color={color()}>
        This box's style will change based on the color mode.
      </Box>
      <Button onClick={toggleColorMode}>Toggle color mode</Button>
    </>
  );
}
