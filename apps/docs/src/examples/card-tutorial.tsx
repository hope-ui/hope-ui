import { Box, Button, Flex, Img, Text } from "@hope-ui/core";

export function CardTutorial() {
  return (
    <Flex
      direction="column"
      border={({ vars }) => `1px solid ${vars.colors.neutral["200"]}`}
      borderColor={{ dark: "neutral.800" }}
      rounded="lg"
      shadow="lg"
      w="full"
      maxW={96}
      bg={{ light: "white", dark: "neutral.900" }}
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
          <Text fontWeight="semibold" color={{ dark: "neutral.300" }}>
            Yosemite National Park
          </Text>
          <Flex
            px={2}
            py={1}
            align="center"
            bgColor={{ light: "success.50", dark: "success.900" }}
            color={{ light: "success.800", dark: "success.300" }}
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
        <Text size="sm" color={{ light: "neutral.500", dark: "neutral.400" }} mb={3}>
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
