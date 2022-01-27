import { HopeProvider } from "@/contexts/HopeContext";

import { Center } from "./Center";
export default {
  title: "Layout/Center",
  component: Center,
  parameters: { layout: "centered" },
  decorators: [
    (Story: any) => (
      <HopeProvider>
        <div
          style={{
            display: "flex",
            "justify-content": "center",
            "align-items": "center",
            width: "90vw",
            height: "90vh",
          }}
        >
          <Story />
        </div>
      </HopeProvider>
    ),
  ],
  argTypes: {
    fullWidth: {
      control: { type: "boolean" },
    },
    fullHeight: {
      control: { type: "boolean" },
    },
    fullSize: {
      control: { type: "boolean" },
    },
  },
  args: {
    fullWidth: false,
    fullHeight: false,
    fullSize: false,
  },
};

export const Default = (args: any) => (
  <Center css={{ bg: "$info200", p: "$4" }} {...args}>
    <p>This is the Center.</p>
  </Center>
);
Default.storyName = "Center";
