const importComponent = `import { Text } from "@hope-ui/solid"`;

const basicUsage = `<Text>I'm a Text</Text>`;

const sizes = `<VStack spacing="$3" alignItems="flex-start">
  <Text size="9xl">(9xl) The quick brown fox</Text>
  <Text size="8xl">(8xl) The quick brown fox</Text>
  <Text size="7xl">(7xl) The quick brown fox</Text>
  <Text size="6xl">(6xl) The quick brown fox</Text>
  <Text size="5xl">(5xl) The quick brown fox</Text>
  <Text size="4xl">(4xl) The quick brown fox</Text>
  <Text size="3xl">(3xl) The quick brown fox</Text>
  <Text size="2xl">(2xl) The quick brown fox</Text>
  <Text size="xl">(xl) The quick brown fox</Text>
  <Text size="lg">(lg) The quick brown fox</Text>
  <Text size="base">(base) The quick brown fox</Text>
  <Text size="sm">(sm) The quick brown fox</Text>
  <Text size="xs">(xs) The quick brown fox</Text>
</VStack>`;

const truncateText = `<Text noOfLines={1}>
  Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing
  industries for previewing layouts and visual mockups.
</Text>`;

const overrideStyle = `<Text fontSize="50px" color="tomato">
  I'm using a custom font-size value for this text
</Text>`;

const overrideElement = `<VStack alignItems="flex-start">
  <Text as="i">Italic</Text>
  <Text as="u">Underline</Text>
  <Text as="abbr">I18N</Text>
  <Text as="cite">Citation</Text>
  <Text as="del">Deleted</Text>
  <Text as="em">Emphasis</Text>
  <Text as="ins">Inserted</Text>
  <Text as="kbd">Ctrl + C</Text>
  <Text as="mark">Highlighted</Text>
  <Text as="s">Strikethrough</Text>
  <Text as="samp">Sample</Text>
  <Text as="sub">sub</Text>
  <Text as="sup">sup</Text>
</VStack>`;

const theming = `const config: HopeThemeConfig = {
  components: {
    Text: {
      baseStyle: SystemStyleObject,
      defaultProps: ThemeableTextOptions
    }
  }
}`;

export const snippets = {
  importComponent,
  basicUsage,
  sizes,
  truncateText,
  overrideStyle,
  overrideElement,
  theming,
};
