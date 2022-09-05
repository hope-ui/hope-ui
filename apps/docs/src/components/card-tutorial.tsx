import { Box, Button, Flex, Image, Text } from "@hope-ui/core";

export function CardTutorial() {
  return (
    <Flex
      direction="column"
      border={({ vars }) => `1px solid ${vars.colors.neutral["200"]}`}
      rounded="lg"
      shadow="lg"
      w="full"
      maxW={96}
    >
      <Image
        src="https://bit.ly/3CVFryX"
        alt="Yosemite National Park"
        //fallback={<Box roundedTop="lg" bg="neutral.100" w="full" h="200px" />}
        roundedTop="lg"
        maxH="200px"
      />
      <Box p={5}>
        <Flex justify="space-between" align="center" w="full" mb={2}>
          <Text fontWeight="semibold">Yosemite National Park</Text>
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
          Yosemite National Park is an American national park in California, surrounded on the
          southeast by Sierra National Forest and on the northwest by Stanislaus National Forest.
        </Text>
        <Button variant="soft" colorScheme="primary" isFullWidth>
          Learn more
        </Button>
      </Box>
    </Flex>
  );
}
