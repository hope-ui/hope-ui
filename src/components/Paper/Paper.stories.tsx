import { HopeProvider } from "@/contexts";

import { Paper } from "./Paper";

const selectControl = {
  control: { type: "select" },
  options: ["none", "xs", "sm", "md", "lg", "xl"],
};

export default {
  title: "General/Paper",
  component: Paper,
  parameters: { layout: "centered" },
  decorators: [
    (Story: any) => (
      <HopeProvider>
        <div style={{ width: "400px" }}>
          <Story />
        </div>
      </HopeProvider>
    ),
  ],
  argTypes: {
    padding: { ...selectControl },
    radius: { ...selectControl },
    shadow: { ...selectControl },
    withBorder: {
      control: { type: "boolean" },
    },
  },
  args: {
    padding: "sm",
    radius: "sm",
    shadow: "sm",
    withBorder: false,
  },
};

export const Default = (args: any) => (
  <Paper {...args}>
    <p>Paper is the most basic ui component</p>
    <p>
      Use it to create cards, dropdowns, modals and other components that require background with
      shadow
    </p>
  </Paper>
);
Default.storyName = "Paper";
