import { Heading, VStack } from "@hope-ui/core";

export function LevelExample() {
  return (
    <VStack spacing={3} align="flex-start">
      <Heading level="1">The quick brown fox</Heading>
      <Heading level="2">The quick brown fox</Heading>
      <Heading level="3">The quick brown fox</Heading>
      <Heading level="4">The quick brown fox</Heading>
      <Heading level="5">The quick brown fox</Heading>
      <Heading level="6">The quick brown fox</Heading>
    </VStack>
  );
}

export function ChangeSizeExample() {
  return (
    <VStack spacing={3} align="flex-start">
      <Heading size="9xl" lineClamp={1}>
        (9xl) The quick brown fox
      </Heading>
      <Heading size="8xl" lineClamp={1}>
        (8xl) The quick brown fox
      </Heading>
      <Heading size="7xl" lineClamp={1}>
        (7xl) The quick brown fox
      </Heading>
      <Heading size="6xl" lineClamp={1}>
        (6xl) The quick brown fox
      </Heading>
      <Heading size="5xl" lineClamp={1}>
        (5xl) The quick brown fox
      </Heading>
      <Heading size="4xl" lineClamp={1}>
        (4xl) The quick brown fox
      </Heading>
      <Heading size="3xl" lineClamp={1}>
        (3xl) The quick brown fox
      </Heading>
      <Heading size="2xl" lineClamp={1}>
        (2xl) The quick brown fox
      </Heading>
      <Heading size="xl" lineClamp={1}>
        (xl) The quick brown fox
      </Heading>
      <Heading size="lg" lineClamp={1}>
        (lg) The quick brown fox
      </Heading>
      <Heading size="base" lineClamp={1}>
        (base) The quick brown fox
      </Heading>
      <Heading size="sm" lineClamp={1}>
        (sm) The quick brown fox
      </Heading>
      <Heading size="xs" lineClamp={1}>
        (xs) The quick brown fox
      </Heading>
    </VStack>
  );
}

export function LineClampExample() {
  return (
    <Heading lineClamp={1}>
      Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries
      for previewing layouts and visual mockups.
    </Heading>
  );
}
