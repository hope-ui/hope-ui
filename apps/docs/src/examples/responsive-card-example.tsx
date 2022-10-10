import { Box, Flex, Image, Text } from "@hope-ui/core";

export function ResponsiveCardExample() {
  return (
    <Flex
      direction={{ base: "column", md: "row" }}
      border={({ vars }) => `1px solid ${vars.colors.neutral["200"]}`}
      rounded="lg"
      shadow="lg"
      w="full"
      maxW={{ base: 96, md: "none" }}
      bg="white"
      _dark={{
        borderColor: "neutral.800",
        bg: "neutral.900",
      }}
    >
      <Image
        src="https://bit.ly/3CVFryX"
        alt="Yosemite National Park"
        objectFit="cover"
        roundedTop={{ base: "lg", md: "none" }}
        roundedLeft={{ md: "lg" }}
        maxH={200}
        maxW={{ md: 250 }}
      />
      <Box p={5}>
        <Flex
          direction={{ md: "column-reverse" }}
          justify="space-between"
          align={{ base: "center", md: "flex-start" }}
          w="full"
          mb={2}
        >
          <Text fontWeight="semibold" mt={{ md: 1 }} _dark={{ color: "neutral.300" }}>
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
        <Text
          size="sm"
          color="neutral.500"
          lineClamp={{ base: 3, md: 5 }}
          _dark={{ color: "neutral.400" }}
        >
          Yosemite National Park is an American national park in California, surrounded on the
          southeast by Sierra National Forest and on the northwest by Stanislaus National Forest.
          The park is managed by the National Park Service and covers an area of 759,620 acres
          (1,187 sq mi; 3,074 km2) and sits in four counties – centered in Tuolumne and Mariposa,
          extending north and east to Mono and south to Madera County. Designated a World Heritage
          Site in 1984, Yosemite is internationally recognized for its granite cliffs, waterfalls,
          clear streams, giant sequoia groves, lakes, mountains, meadows, glaciers, and biological
          diversity. Almost 95 percent of the park is designated wilderness.
        </Text>
      </Box>
    </Flex>
  );
}
