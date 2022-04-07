import { HopeWrapper } from "../../utils/storybook";
import { Container } from "./container";

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
  <Container bg="$info7" {...args}>
    <p>Resize the window to see the changes in the container width.</p>
  </Container>
);
Default.storyName = "Container";
