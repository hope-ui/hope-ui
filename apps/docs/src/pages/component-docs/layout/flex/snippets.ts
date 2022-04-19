const importComponent = `import { Flex, Spacer } from "@hope-ui/solid"`;

const basicUsage = `<Flex color="white">
  <Center w="100px" bg="$success10">
    <Text>Box 1</Text>
  </Center>
  <Center boxSize="150px" bg="$info10">
    <Text>Box 2</Text>
  </Center>
  <Box flex="1" bg="tomato">
    <Text>Box 3</Text>
  </Box>
</Flex>`;

const usingSpacer = `<Flex>
  <Box p="$4" bg="$danger9">
    Box 1
  </Box>
  <Spacer />
  <Box p="$4" bg="$success9">
    Box 2
  </Box>
</Flex>`;

const vs = `<Box>
  <Text>Flex and Spacer: Full width, equal spacing</Text>
  <Flex>
    <Box w="70px" h="$10" bg="$danger9" />
    <Spacer />
    <Box w="170px" h="$10" bg="$danger9" />
    <Spacer />
    <Box w="180px" h="$10" bg="$danger9" />
  </Flex>

  <Text>Grid: The children start at the beginning, the 1/3 mark and 2/3 mark</Text>
  <Grid templateColumns="repeat(3, 1fr)" gap="$6">
    <Box w="70px" h="$10" bg="$info9" />
    <Box w="170px" h="$10" bg="$info9" />
    <Box w="180px" h="$10" bg="$info9" />
  </Grid>

  <Text>HStack: The children have equal spacing but don't span the whole container</Text>
  <HStack spacing="24px">
    <Box w="70px" h="$10" bg="$success9" />
    <Box w="170px" h="$10" bg="$success9" />
    <Box w="180px" h="$10" bg="$success9" />
  </HStack>
</Box>`;

const spacerUseCase = `<Flex>
  <Box p="$2">
    <Heading size="xl" fontWeight="$bold">
      Hope App
    </Heading>
  </Box>
  <Spacer />
  <Box>
    <Button mr="$4">Sign Up</Button>
    <Button>Log in</Button>
  </Box>
</Flex>`;

export const snippets = {
  importComponent,
  basicUsage,
  usingSpacer,
  vs,
  spacerUseCase,
};
