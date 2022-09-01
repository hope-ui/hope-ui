import { Box, Button, Flex, hope, HStack, Text, VStack } from "@hope-ui/core";

export function SimpleCardTutorial() {
  return (
    <Flex
      direction="column"
      border={vars => `1px solid ${vars.colors.neutral["200"]}`}
      borderRadius="lg"
      shadow="lg"
      width="full"
      maxWidth={96}
    >
      <hope.img
        borderTopRadius="lg"
        src="https://bit.ly/2BHijUw"
        alt="Yosemite National Park"
        sx={{ objectFit: "cover" }}
      />
      <VStack padding={5} spacing={2}>
        <HStack spacing={2} justifyContent="space-between" width="full">
          <Text fontWeight="semibold">Yosemite National Park</Text>
          <Box px={2} py={0.5} backgroundColor="success.50" color="success.800" borderRadius="full">
            <Text size="xs" fontWeight="semibold" textTransform="uppercase">
              Nature
            </Text>
          </Box>
        </HStack>
        <Text size="sm" color="neutral.500">
          Yosemite National Park is an American national park in California, surrounded on the
          southeast by Sierra National Forest and on the northwest by Stanislaus National Forest.
        </Text>
        <Button variant="soft" colorScheme="primary" isFullWidth mt={3}>
          Learn more
        </Button>
      </VStack>
    </Flex>
  );
}
