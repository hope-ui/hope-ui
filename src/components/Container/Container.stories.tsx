import { HopeProvider } from "@/contexts";

import { Container } from "./Container";

export default {
  title: "Layout/Container",
  component: Container,
  decorators: [
    (Story: any) => (
      <HopeProvider>
        <Story />
      </HopeProvider>
    ),
  ],
  argTypes: {
    centered: {
      control: { type: "boolean" },
    },
  },
  args: {
    centered: true,
  },
};

export const Default = (args: any) => (
  <Container style={{ background: "#93c5fd", "text-align": "center" }} {...args}>
    <p>Resize the window to see the changes in the container width.</p>
  </Container>
);
Default.storyName = "Container";
