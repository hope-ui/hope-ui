const importComponent = `import { CloseButton } from "@hope-ui/design-system"`;

const basicUsage = `<CloseButton />`;

const closeButtonSizes = `<HStack spacing="$4">
  <CloseButton size="sm" />
  <CloseButton size="md" />
  <CloseButton size="lg" />
</HStack>`;

const theming = `const config: HopeThemeConfig = {
  components: {
    CloseButton: {
      baseStyle: SystemStyleObject,
      defaultProps: ThemeableCloseButtonOptions
    }
  }
}`;

export const snippets = {
  importComponent,
  basicUsage,
  closeButtonSizes,
  theming,
};
