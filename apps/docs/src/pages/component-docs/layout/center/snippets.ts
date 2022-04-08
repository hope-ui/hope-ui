const importComponent = `import { Center } from "@hope-ui/solid"`;

const basicUsage = `<Center bg="tomato" h="100px" color="white">
  This is the Center
</Center>`;

const withIcons = `<HStack spacing="$2">
  <Center w="40px" h="40px" bg="tomato" color="white">
    <IconPhone />
  </Center>
  <Center w="40px" h="40px" bg="tomato" color="white">
    <Box as="span" fontWeight="$bold" fontSize="$lg">
      1
    </Box>
  </Center>
</HStack>`;

export const snippets = {
  importComponent,
  basicUsage,
  withIcons,
};
