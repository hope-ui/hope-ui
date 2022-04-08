const importComponent = `import { Stack, HStack, VStack } from "@hope-ui/solid"`;

const basicUsage = `<HStack spacing="24px">
  <Box w="40px" h="40px" bg="$warning9">
    1
  </Box>
  <Box w="40px" h="40px" bg="tomato">
    2
  </Box>
  <Box w="40px" h="40px" bg="pink">
    3
  </Box>
</HStack>`;

const responsiveDirection = `<Stack direction={{ "@initial": "column", "@md": "row" }} spacing="24px">
  <Box w="40px" h="40px" bg="$warning9">
    1
  </Box>
  <Box w="40px" h="40px" bg="tomato">
    2
  </Box>
  <Box w="40px" h="40px" bg="pink">
    3
  </Box>
</Stack>`;

export const snippets = {
  importComponent,
  basicUsage,
  responsiveDirection,
};
