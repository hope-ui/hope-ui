const importComponent = `import { SimpleGrid } from "@hope-ui/design-system"`;

const basicUsage = `<SimpleGrid columns={2} gap="$10">
  <Box bg="tomato" height="80px"></Box>
  <Box bg="tomato" height="80px"></Box>
  <Box bg="tomato" height="80px"></Box>
  <Box bg="tomato" height="80px"></Box>
  <Box bg="tomato" height="80px"></Box>
</SimpleGrid>`;

const responsiveColumns = `<SimpleGrid columns={{ "@initial": 2, "@md": 3 }} gap="40px">
  <Box bg="tomato" height="80px"></Box>
  <Box bg="tomato" height="80px"></Box>
  <Box bg="tomato" height="80px"></Box>
  <Box bg="tomato" height="80px"></Box>
  <Box bg="tomato" height="80px"></Box>
</SimpleGrid>`;

const autoResponsive = `<SimpleGrid minChildWidth="120px" gap="40px">
  <Box bg="tomato" height="80px"></Box>
  <Box bg="tomato" height="80px"></Box>
  <Box bg="tomato" height="80px"></Box>
  <Box bg="tomato" height="80px"></Box>
  <Box bg="tomato" height="80px"></Box>
  <Box bg="tomato" height="80px"></Box>
</SimpleGrid>`;

const spacing = `<SimpleGrid columns={2} columnGap="40px" rowGap="20px">
  <Box bg="tomato" height="80px"></Box>
  <Box bg="tomato" height="80px"></Box>
  <Box bg="tomato" height="80px"></Box>
  <Box bg="tomato" height="80px"></Box>
  <Box bg="tomato" height="80px"></Box>
</SimpleGrid>`;

export const snippets = {
  importComponent,
  basicUsage,
  responsiveColumns,
  autoResponsive,
  spacing,
};
