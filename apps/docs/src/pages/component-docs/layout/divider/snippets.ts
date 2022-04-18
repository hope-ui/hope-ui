const importComponent = `import { Divider } from "@hope-ui/design-system"`;

const basicUsage = `<Divider />`;

const horizontal = `<Divider orientation="horizontal" />`;

const vertical = `<Center height="50px">
  <Divider orientation="vertical" />
</Center>`;

const variants = `<VStack spacing="$4">
  <Divider variant="solid" />
  <Divider variant="dashed" />
  <Divider variant="dotted" />
</VStack>`;

const thickness = `<Divider thickness="3px" />`;

export const snippets = {
  importComponent,
  basicUsage,
  horizontal,
  vertical,
  variants,
  thickness,
};
