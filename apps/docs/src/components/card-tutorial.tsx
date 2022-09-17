import { Box, Button, Flex, Img, Text } from "@hope-ui/core";

export function CardTutorial() {
  return (
    <Flex
      direction="column"
      border={({ vars }) => `1px solid ${vars.colors.neutral["200"]}`}
      rounded="lg"
      shadow="lg"
      w="full"
      maxW={96}
      bg="white"
      _dark={{
        borderColor: "neutral.800",
        bg: "neutral.900",
      }}
    >
      <Img
        src="https://bit.ly/3CVFryX"
        alt="Yosemite National Park"
        objectFit="cover"
        roundedTop="lg"
        maxH="200px"
      />
      <Box p={5}>
        <Flex justify="space-between" align="center" w="full" mb={2}>
          <Text fontWeight="semibold" _dark={{ color: "neutral.300" }}>
            Yosemite National Park
          </Text>
          <Flex
            px={2}
            py={1}
            align="center"
            bgColor="success.50"
            color="success.800"
            rounded="full"
            _dark={{
              bgColor: "success.900",
              color: "success.300",
            }}
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
        <Text size="sm" color="neutral.500" mb={3} _dark={{ color: "neutral.400" }}>
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
