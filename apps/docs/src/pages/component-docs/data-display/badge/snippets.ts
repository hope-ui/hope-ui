const importComponent = `import { Badge } from "@hope-ui/design-system"`;

const basicUsage = `<Badge>Badge</Badge>`;

const colors = `<HStack spacing="$4">
  <Badge colorScheme="primary">Badge</Badge>
  <Badge colorScheme="accent">Badge</Badge>
  <Badge colorScheme="neutral">Badge</Badge>
  <Badge colorScheme="success">Badge</Badge>
  <Badge colorScheme="info">Badge</Badge>
  <Badge colorScheme="warning">Badge</Badge>
  <Badge colorScheme="danger">Badge</Badge>
</HStack>`;

const variants = `<HStack spacing="$4">
  <Badge variant="solid">Badge</Badge>
  <Badge variant="subtle">Badge</Badge>
  <Badge variant="outline">Badge</Badge>
</HStack>`;

const theming = `const config: HopeThemeConfig = {
  components: {
    Badge: {
      baseStyle: SystemStyleObject,
      defaultProps: ThemeableBadgeOptions
    }
  }
}`;

export const snippets = {
  importComponent,
  basicUsage,
  colors,
  variants,
  theming,
};
