const importComponent = `import { Spinner } from "@hope-ui/solid"`;

const basicUsage = `<Spinner />`;

const color = `<Spinner color="tomato" />`;

const emptyAreaColor = `<Spinner 
  thickness="4px" 
  speed="0.65s" 
  emptyColor="$neutral4" 
  color="$info10" 
  size="xl" 
/>`;

const sizes = `<HStack spacing="$4">
  <Spinner size="xs" />
  <Spinner size="sm" />
  <Spinner size="md" />
  <Spinner size="lg" />
  <Spinner size="xl" />
</HStack>`;

const theming = `const config: HopeThemeConfig = {
  components: {
    Spinner: {
      baseStyle: SystemStyleObject,
      defaultProps: ThemeableSpinnerOptions
    }
  }
}`;

export const snippets = {
  importComponent,
  basicUsage,
  color,
  emptyAreaColor,
  sizes,
  theming,
};
