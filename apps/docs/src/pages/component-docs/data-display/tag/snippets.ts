const importComponent = `import {
  Tag,
  TagCloseButton,
  TagLabel,
  TagLeftIcon,
  TagRightIcon,
} from "@hope-ui/design-system"`;

const basicUsage = `<Tag>Sample Tag</Tag>`;

const colors = `<HStack spacing="$4">
  <Tag colorScheme="primary">Tag</Tag>
  <Tag colorScheme="accent">Tag</Tag>
  <Tag colorScheme="neutral">Tag</Tag>
  <Tag colorScheme="success">Tag</Tag>
  <Tag colorScheme="info">Tag</Tag>
  <Tag colorScheme="warning">Tag</Tag>
  <Tag colorScheme="danger">Tag</Tag>
</HStack>`;

const sizes = `<HStack spacing="$4">
  <Tag size="sm">Tag</Tag>
  <Tag size="md">Tag</Tag>
  <Tag size="lg">Tag</Tag>
</HStack>`;

const variants = `<HStack spacing="$4">
  <Tag variant="solid">Tag</Tag>
  <Tag variant="subtle">Tag</Tag>
  <Tag variant="outline">Tag</Tag>
  <Tag variant="dot" dotPlacement="start">Tag</Tag>
  <Tag variant="dot" dotPlacement="end">Tag</Tag>
</HStack>`;

const withLeftIcon = `<HStack spacing="$4">
  <Tag size="sm">
    <TagLeftIcon as={IconPlus} />
    <TagLabel>Tag</TagLabel>
  </Tag>
  <Tag size="md">
    <TagLeftIcon as={IconPlus} />
    <TagLabel>Tag</TagLabel>
  </Tag>
  <Tag size="lg">
    <TagLeftIcon as={IconPlus} />
    <TagLabel>Tag</TagLabel>
  </Tag>
</HStack>`;

const withRightIcon = `<HStack spacing="$4">
  <Tag size="sm">
    <TagLabel>Tag</TagLabel>
    <TagRightIcon as={IconGear} />
  </Tag>
  <Tag size="md">
    <TagLabel>Tag</TagLabel>
    <TagRightIcon as={IconGear} />
  </Tag>
  <Tag size="lg">
    <TagLabel>Tag</TagLabel>
    <TagRightIcon as={IconGear} />
  </Tag>
</HStack>`;

const withCloseButton = `<HStack spacing="$4">
  <Tag size="sm">
    <TagLabel>Tag</TagLabel>
    <TagCloseButton />
  </Tag>
  <Tag size="md">
    <TagLabel>Tag</TagLabel>
    <TagCloseButton />
  </Tag>
  <Tag size="lg">
    <TagLabel>Tag</TagLabel>
    <TagCloseButton />
  </Tag>
</HStack>`;

const theming = `const config: HopeThemeConfig = {
  components: {
    Tag: {
      baseStyle: {
        root: SystemStyleObject,
        icon: SystemStyleObject,
        label: SystemStyleObject,
        closeButton: SystemStyleObject,
      },
      defaultProps: {
        root: ThemeableTagOptions,
      }
    }
  }
}`;

export const snippets = {
  importComponent,
  basicUsage,
  colors,
  sizes,
  variants,
  withLeftIcon,
  withRightIcon,
  withCloseButton,
  theming,
};
