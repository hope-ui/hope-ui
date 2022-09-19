import { Box, useColorMode } from "../src";

export default function App() {
  const { toggleColorMode } = useColorMode();

  return (
    <>
      <button onClick={toggleColorMode}>toggle color mode</button>
      <Box
        mb={4}
        p={2}
        bg="tomato|royalblue"
        color="black|white"
        _dark={{
          fontWeight: "bold",
          _hover: {
            fontSize: "2xl",
          },
        }}
      >
        This box's style will change based on the color mode.
      </Box>
    </>
  );
}
