const importComponent = `import { Heading } from "@hope-ui/solid"`;

const basicUsage = `<Heading>I'm a Heading</Heading>`;

const level = `<VStack spacing="$3" alignItems="flex-start">
  <Heading level="1">The quick brown fox</Heading>
  <Heading level="2">The quick brown fox</Heading>
  <Heading level="3">The quick brown fox</Heading>
  <Heading level="4">The quick brown fox</Heading>
  <Heading level="5">The quick brown fox</Heading>
  <Heading level="6">The quick brown fox</Heading>
</VStack>`;

const sizes = `<VStack spacing="$3" alignItems="flex-start">
  <Heading size="9xl">(9xl) The quick brown fox</Heading>
  <Heading size="8xl">(8xl) The quick brown fox</Heading>
  <Heading size="7xl">(7xl) The quick brown fox</Heading>
  <Heading size="6xl">(6xl) The quick brown fox</Heading>
  <Heading size="5xl">(5xl) The quick brown fox</Heading>
  <Heading size="4xl">(4xl) The quick brown fox</Heading>
  <Heading size="3xl">(3xl) The quick brown fox</Heading>
  <Heading size="2xl">(2xl) The quick brown fox</Heading>
  <Heading size="xl">(xl) The quick brown fox</Heading>
  <Heading size="lg">(lg) The quick brown fox</Heading>
  <Heading size="base">(base) The quick brown fox</Heading>
  <Heading size="sm">(sm) The quick brown fox</Heading>
  <Heading size="xs">(xs) The quick brown fox</Heading>
</VStack>`;

const truncateText = `<Heading noOfLines={1}>
  Lorem ipsum is placeholder Heading commonly used in the graphic, print, and publishing
  industries for previewing layouts and visual mockups.
</Heading>`;

const overrideStyle = `<Heading fontSize="50px" color="tomato">
  I'm using a custom font-size value for this heading
</Heading>`;

const theming = `const config: HopeThemeConfig = {
  components: {
    Heading: {
      baseStyle: SystemStyleObject,
      defaultProps: ThemeableHeadingOptions
    }
  }
}`;

export const snippets = {
  importComponent,
  basicUsage,
  level,
  sizes,
  truncateText,
  overrideStyle,
  theming,
};
