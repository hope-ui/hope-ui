import { Box, Button, Flex, Text } from "@hope-ui/core";

export function CardTutorialFinal() {
  return (
    <Flex
      direction="column"
      border={vars => `1px solid ${vars.colors.neutral["200"]}`}
      rounded="lg"
      shadow="lg"
      w="full"
      maxW={96}
      overflow="clip"
    >
      <img src="https://bit.ly/3TIBe7N" alt="Reunion Island" />
      <Box p={5}>
        <Flex justify="space-between" align="center" w="full" mb={2}>
          <Text fontWeight="semibold">Reunion Island</Text>
          <Flex
            px={2}
            py={1}
            align="center"
            bgColor="success.50"
            color="success.800"
            rounded="full"
          >
            <Text
              as="span"
              size="xs"
              lineHeight="none"
              fontWeight="semibold"
              textTransform="uppercase"
            >
              Nature
            </Text>
          </Flex>
        </Flex>
        <Text size="sm" color="neutral.500" mb={3}>
          La Reunion, previously Ile Bourbon; is an island in the Indian Ocean that is an overseas
          department and region of France.
        </Text>
        <Button variant="soft" colorScheme="primary" isFullWidth mt={3}>
          Learn more
        </Button>
      </Box>
    </Flex>
  );
}
