const importComponent = `import { Container } from "@hope-ui/design-system"`;

const basicUsage = `<Container>
  There are many benefits to a joint design and development system. Not only does it bring
  benefits to the design team, but it also brings benefits to engineering teams. It makes
  sure that our experiences have a consistent look and feel, not just in our design specs,
  but in production
</Container>`;

const centerContainer = `<Container p="$4" bg="tomato" color="white" maxW="$xl" centered={false}>
  There are many benefits to a joint design and development system. Not only does it bring
  benefits to the design team.
</Container>`;

const centerContent = `<Container bg="salmon" centerContent>
  <Box p="$4" bg="tomato" color="white" maxW="$xl">
    There are many benefits to a joint design and development system. Not only does it bring
    benefits to the design team.
  </Box>
</Container>`;

export const snippets = {
  importComponent,
  basicUsage,
  centerContainer,
  centerContent,
};
