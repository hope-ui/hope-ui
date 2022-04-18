const importComponent = `import { Grid, GridItem } from "@hope-ui/design-system"`;

const templateColumns = `<Grid templateColumns="repeat(5, 1fr)" gap="$6">
  <GridItem w="100%" h="$10" bg="$info9" />
  <GridItem w="100%" h="$10" bg="$info9" />
  <GridItem w="100%" h="$10" bg="$info9" />
  <GridItem w="100%" h="$10" bg="$info9" />
  <GridItem w="100%" h="$10" bg="$info9" />
</Grid>`;

const spanningColumns = `<Grid 
  h="200px" 
  templateRows="repeat(2, 1fr)" 
  templateColumns="repeat(5, 1fr)" 
  gap="$4"
>
  <GridItem rowSpan={2} colSpan={1} bg="tomato" />
  <GridItem colSpan={2} bg="papayawhip" />
  <GridItem colSpan={2} bg="papayawhip" />
  <GridItem colSpan={4} bg="tomato" />
</Grid>`;

const startingAndEndingLines = `<Grid templateColumns="repeat(5, 1fr)" gap="$4">
  <GridItem colSpan={2} h="$10" bg="tomato" />
  <GridItem colStart={4} colEnd={6} h="$10" bg="papayawhip" />
</Grid>`;

export const snippets = {
  importComponent,
  templateColumns,
  spanningColumns,
  startingAndEndingLines,
};
