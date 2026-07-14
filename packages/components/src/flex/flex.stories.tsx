import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Box } from "../box";
import { Flex } from "./flex";

const meta = {
  title: "Components/Flex",
  component: Flex,
} satisfies Meta<typeof Flex>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The flexbox shorthands (`align`/`justify`/`direction`/`wrap`/…) map to real CSS at render.
 * A row that spreads its children apart and centers them on the cross axis.
 */
export const Row: Story = {
  render: () => (
    <Flex justify="space-between" align="center" gap="4" p="4" bg="surface.raised" rounded="lg">
      <Box p="2" bg="primary" color="text.primary.foreground" rounded="md">
        One
      </Box>
      <Box p="2" bg="primary" color="text.primary.foreground" rounded="md">
        Two
      </Box>
      <Box p="2" bg="primary" color="text.primary.foreground" rounded="md">
        Three
      </Box>
    </Flex>
  ),
};

/**
 * `direction="column"` stacks children vertically; `gap` spaces them.
 */
export const Column: Story = {
  render: () => (
    <Flex direction="column" gap="2" p="4" borderWidth="1px" borderColor="border" rounded="lg">
      <Box>First</Box>
      <Box>Second</Box>
      <Box>Third</Box>
    </Flex>
  ),
};

/**
 * `grow`/`basis` control how children share the free space. The middle child grows to fill.
 */
export const GrowAndBasis: Story = {
  render: () => (
    <Flex gap="2" p="4" bg="surface.raised" rounded="lg">
      <Flex
        basis="80px"
        justify="center"
        p="2"
        bg="primary"
        color="text.primary.foreground"
        rounded="md"
      >
        Fixed
      </Flex>
      <Flex
        grow="1"
        justify="center"
        align="center"
        p="2"
        bg="primary"
        color="text.primary.foreground"
        rounded="md"
      >
        Grows
      </Flex>
      <Flex
        basis="80px"
        justify="center"
        p="2"
        bg="primary"
        color="text.primary.foreground"
        rounded="md"
      >
        Fixed
      </Flex>
    </Flex>
  ),
};

/**
 * `inline` renders `inline-flex`, so the Flex sits inline with surrounding text.
 */
export const Inline: Story = {
  render: () => (
    <Box>
      text before{" "}
      <Flex
        inline
        align="center"
        gap="1"
        px="2"
        bg="primary"
        color="text.primary.foreground"
        rounded="md"
      >
        <Box>inline</Box>
        <Box>flex</Box>
      </Flex>{" "}
      text after
    </Box>
  ),
};
