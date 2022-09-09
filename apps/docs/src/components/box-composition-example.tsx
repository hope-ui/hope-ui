import { Box } from "@hope-ui/core";

export function BoxCompositionExample() {
  return (
    <Box
      display="flex"
      flexDirection="column"
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
      <Box
        as="img"
        src="https://bit.ly/3CVFryX"
        alt="Yosemite National Park"
        objectFit="cover"
        roundedTop="lg"
        maxH="200px"
      />
      <Box p={5}>
        <Box display="flex" justifyContent="space-between" alignItems="center" w="full" mb={2}>
          <Box
            as="span"
            fontSize="base"
            lineHeight={6}
            fontWeight="semibold"
            _dark={{ color: "neutral.300" }}
          >
            Yosemite National Park
          </Box>
          <Box
            display="flex"
            px={2}
            py={1}
            alignItems="center"
            bgColor="success.50"
            color="success.800"
            rounded="full"
            _dark={{
              bgColor: "success.900",
              color: "success.300",
            }}
          >
            <Box
              as="span"
              fontSize="xs"
              lineHeight="none"
              fontWeight="semibold"
              textTransform="uppercase"
            >
              Nature
            </Box>
          </Box>
        </Box>
        <Box
          as="p"
          fontSize="sm"
          lineHeight={5}
          color="neutral.500"
          _dark={{ color: "neutral.400" }}
        >
          Yosemite National Park is an American national park in California, surrounded on the
          southeast by Sierra National Forest and on the northwest by Stanislaus National Forest.
        </Box>
      </Box>
    </Box>
  );
}
