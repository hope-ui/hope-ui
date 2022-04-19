const importComponent = `import { IconButton } from "@hope-ui/solid"`;

const basicUsage = `<IconButton aria-label="Search" icon={<IconSearch />} />`;

const buttonColors = `<HStack spacing="$4">
  <IconButton colorScheme="primary" aria-label="Search" icon={<IconSearch />} />
  <IconButton colorScheme="accent" aria-label="Search" icon={<IconSearch />} />
  <IconButton colorScheme="neutral" aria-label="Search" icon={<IconSearch />} />
  <IconButton colorScheme="success" aria-label="Search" icon={<IconSearch />} />
  <IconButton colorScheme="info" aria-label="Search" icon={<IconSearch />} />
  <IconButton colorScheme="warning" aria-label="Search" icon={<IconSearch />} />
  <IconButton colorScheme="danger" aria-label="Search" icon={<IconSearch />} />
</HStack>`;

const buttonSizes = `<HStack spacing="$4">
  <IconButton size="xs" aria-label="Search" icon={<IconSearch />} />
  <IconButton size="sm" aria-label="Search" icon={<IconSearch />} />
  <IconButton size="md" aria-label="Search" icon={<IconSearch />} />
  <IconButton size="lg" aria-label="Search" icon={<IconSearch />} />
  <IconButton size="xl" aria-label="Search" icon={<IconSearch />} />
</HStack>`;

const buttonSizesCompact = `<HStack spacing="$4">
  <IconButton size="xs" compact aria-label="Search" icon={<IconSearch />} />
  <IconButton size="sm" compact aria-label="Search" icon={<IconSearch />} />
  <IconButton size="md" compact aria-label="Search" icon={<IconSearch />} />
  <IconButton size="lg" compact aria-label="Search" icon={<IconSearch />} />
  <IconButton size="xl" compact aria-label="Search" icon={<IconSearch />} />
</HStack>`;

const buttonVariants = `<HStack spacing="$4">
  <IconButton variant="solid" aria-label="Search" icon={<IconSearch />} />
  <IconButton variant="subtle" aria-label="Search" icon={<IconSearch />} />
  <IconButton variant="outline" aria-label="Search" icon={<IconSearch />} />
  <IconButton variant="dashed" aria-label="Search" icon={<IconSearch />} />
  <IconButton variant="ghost" aria-label="Search" icon={<IconSearch />} />
</HStack>`;

const buttonLoadingState = `<IconButton loading aria-label="Search" icon={<IconSearch />} />`;

const buttonCustomLoader = `<IconButton
  loading
  loader={<BeatLoader boxSize="$6" />}
  aria-label="Search"
  icon={<IconSearch />}
/>`;

const theming = `const config: HopeThemeConfig = {
  components: {
    IconButton: {
      baseStyle: SystemStyleObject,
      defaultProps: ThemeableIconButtonOptions
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
  buttonLoadingState,
  buttonCustomLoader,
  theming,
};
