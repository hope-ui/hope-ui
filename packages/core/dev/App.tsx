import { Box, useColorMode } from "../src";

export default function App() {
  const { toggleColorMode } = useColorMode();

  return (
    <>
      <button onClick={toggleColorMode}>toggle color mode</button>
      <Box
        mb={4}
        p={{ light: 2, dark: 4 }}
        bg={{
          base: { light: "blue", dark: "red" },
          sm: { light: "tomato", dark: "teal" },
          md: { light: "green", dark: "yellow" },
        }}
        color={[{ light: "black", dark: "white" }, null, { light: "white", dark: "black" }]}
        _hover={{
          fontWeight: "bold",
          _dark: {
            fontWeight: "hairline",
          },
        }}
      >
        This box's style will change based on the color mode.
      </Box>
    </>
  );
}
