import { HopeWrapper } from "@/utils/storybookUtils";

import { Container } from "./Container";

export default {
  title: "Layout/Container",
  component: Container,
  decorators: [
    (Story: any) => (
      <HopeWrapper>
        <Story />
      </HopeWrapper>
    ),
  ],
  argTypes: {
    centered: {
      control: { type: "boolean" },
    },
    centerContent: {
      control: { type: "boolean" },
    },
  },
  args: {
    centered: true,
    centerContent: false,
  },
};

export const Default = (args: any) => (
  <Container css={{ bg: "$info200" }} {...args}>
    <p>Resize the window to see the changes in the container width.</p>
  </Container>
);
Default.storyName = "Container";
