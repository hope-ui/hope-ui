const importComponent = `import { Button } from "@hope-ui/solid"`;

const basicUsage = `<Button>Button</Button>`;

const buttonColors = `<HStack spacing="$4">
  <Button colorScheme="primary">Button</Button>
  <Button colorScheme="accent">Button</Button>
  <Button colorScheme="neutral">Button</Button>
  <Button colorScheme="success">Button</Button>
  <Button colorScheme="info">Button</Button>
  <Button colorScheme="warning">Button</Button>
  <Button colorScheme="danger">Button</Button>
</HStack>`;

const buttonSizes = `<HStack spacing="$4">
  <Button size="xs">Button</Button>
  <Button size="sm">Button</Button>
  <Button size="md">Button</Button>
  <Button size="lg">Button</Button>
  <Button size="xl">Button</Button>
</HStack>`;

const buttonSizesCompact = `<HStack spacing="$4">
  <Button size="xs" compact>Button</Button>
  <Button size="sm" compact>Button</Button>
  <Button size="md" compact>Button</Button>
  <Button size="lg" compact>Button</Button>
  <Button size="xl" compact>Button</Button>
</HStack>`;

const buttonVariants = `<HStack spacing="$4">
  <Button variant="solid">Button</Button>
  <Button variant="subtle">Button</Button>
  <Button variant="outline">Button</Button>
  <Button variant="dashed">Button</Button>
  <Button variant="ghost">Button</Button>
</HStack>`;

const buttonWithIcon = `<HStack spacing="$4">
  <Button leftIcon={<IconEmail boxSize={18} />}>Email</Button>
  <Button rightIcon={<IconArrowRight />} variant="outline">
    Call us
  </Button>
</HStack>`;

const buttonLoadingState = `<HStack spacing="$4">
  <Button loading>Loading</Button>
  <Button variant="outline" loading loadingText="Submitting">
    Submit
  </Button>
</HStack>`;

const buttonCustomLoader = `<Button loading loader={<BeatLoader boxSize="$8" />}>
  Button
</Button>`;

const buttonLoaderPlacement = `<HStack spacing="$4">
  <Button variant="outline" loading loadingText="Loading" loaderPlacement="start">
    Submit
  </Button>
  <Button variant="outline" loading loadingText="Loading" loaderPlacement="end">
    Continue
  </Button>
</HStack>`;

const buttonGroup = `<ButtonGroup variant="outline" spacing="$6">
  <Button colorScheme="info">Save</Button>
  <Button>Cancel</Button>
</ButtonGroup>`;

const buttonGroupAttached = `<ButtonGroup size="sm" variant="outline" attached>
  <Button mr="-1px">Save</Button>
  <IconButton aria-label="Add to friends" icon={<IconPlus />} />
</ButtonGroup>`;

const composition = `// The size prop affects the height of the button
// It can still be overridden by passing a custom height
<Button
  variant="default"
  size="md"
  height="48px"
  width="200px"
  borderWidth="2px"
  borderColor="$success8"
>
  Button
</Button>`;

const theming = `const config: HopeThemeConfig = {
  components: {
    Button: {
      baseStyle: {
        root: SystemStyleObject,
        group: SystemStyleObject,
      },
      defaultProps: {
        root: ThemeableButtonOptions,
        group: ThemeableButtonGroupOptions,
      };
    }
  }
}`;

export const snippets = {
  importComponent,
  basicUsage,
  buttonColors,
  buttonSizes,
  buttonSizesCompact,
  buttonVariants,
  buttonWithIcon,
  buttonLoadingState,
  buttonCustomLoader,
  buttonLoaderPlacement,
  buttonGroup,
  buttonGroupAttached,
  composition,
  theming,
};
