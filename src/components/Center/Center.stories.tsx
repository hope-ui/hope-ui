import { HopeProvider } from "@/contexts";

import { Center } from "./Center";
import { IconChevronLeft } from "@/icons";

export default {
  title: "Layout/Center",
  component: Center,
  parameters: { layout: "centered" },
  decorators: [
    (Story: any) => (
      <HopeProvider>
        <Story />
      </HopeProvider>
    ),
  ],
  argTypes: {
    inline: {
      control: { type: "boolean" },
    },
  },
};

export const Default = (args: any) => (
  <Center style={{ background: "#93c5fd", height: "100px", width: "400px" }} {...args}>
    <p>All elements inside Center are centered</p>
  </Center>
);
Default.storyName = "Center";

export const Inline = (args: any) => (
  <div style={{ width: "600px", background: "#3b82f6" }}>
    <a href="https://solidjs.com">
      <Center style={{ background: "#93c5fd" }} {...args}>
        <IconChevronLeft />
        <span>Inline will prevent center to take full width</span>
      </Center>
    </a>
  </div>
);
Inline.args = { inline: true };
