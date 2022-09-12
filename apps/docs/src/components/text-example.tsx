import { Text, VStack } from "@hope-ui/core";

export function ChangeSizeExample() {
  return (
    <VStack spacing={3} align="flex-start">
      <Text size="9xl" lineClamp={1}>
        (9xl) The quick brown fox
      </Text>
      <Text size="8xl" lineClamp={1}>
        (8xl) The quick brown fox
      </Text>
      <Text size="7xl" lineClamp={1}>
        (7xl) The quick brown fox
      </Text>
      <Text size="6xl" lineClamp={1}>
        (6xl) The quick brown fox
      </Text>
      <Text size="5xl" lineClamp={1}>
        (5xl) The quick brown fox
      </Text>
      <Text size="4xl" lineClamp={1}>
        (4xl) The quick brown fox
      </Text>
      <Text size="3xl" lineClamp={1}>
        (3xl) The quick brown fox
      </Text>
      <Text size="2xl" lineClamp={1}>
        (2xl) The quick brown fox
      </Text>
      <Text size="xl" lineClamp={1}>
        (xl) The quick brown fox
      </Text>
      <Text size="lg" lineClamp={1}>
        (lg) The quick brown fox
      </Text>
      <Text size="base" lineClamp={1}>
        (base) The quick brown fox
      </Text>
      <Text size="sm" lineClamp={1}>
        (sm) The quick brown fox
      </Text>
      <Text size="xs" lineClamp={1}>
        (xs) The quick brown fox
      </Text>
    </VStack>
  );
}

export function LineClampExample() {
  return (
    <Text lineClamp={1}>
      Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries
      for previewing layouts and visual mockups.
    </Text>
  );
}
