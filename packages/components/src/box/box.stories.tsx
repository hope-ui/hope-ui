import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Box } from "./box";

const meta = {
  title: "Components/Box",
  component: Box,
} satisfies Meta<typeof Box>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Style props on the JSX map to atomic classes at render. The CSS comes from the
 * consumer's `panda codegen` (Storybook's own, here) — hope-ui ships no CSS.
 */
export const StyleProps: Story = {
  render: () => (
    <Box p="6" bg="primary" color="primary.foreground" rounded="lg">
      Styled with style props
    </Box>
  ),
};

/**
 * `as` swaps the underlying element while keeping the style-prop → class mapping.
 */
export const AsElement: Story = {
  render: () => (
    <Box as="section" p="4" borderWidth="1px" borderColor="border" rounded="md">
      Rendered as a section
    </Box>
  ),
};

/**
 * A card composed purely from style props against the nova semantic tokens. Wrap the
 * canvas in `.dark` to see the `_dark` values resolve.
 */
export const Card: Story = {
  render: () => (
    <Box
      bg="card"
      color="card.foreground"
      borderWidth="1px"
      borderColor="border"
      rounded="lg"
      p="6"
    >
      <Box mb="2" fontWeight="semibold">
        Card title
      </Box>
      <Box color="muted.foreground">A surface built entirely from Box style props.</Box>
    </Box>
  ),
};
