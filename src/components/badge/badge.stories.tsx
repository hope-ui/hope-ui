import { HopeWrapper } from "@/utils/storybook";

import { Badge } from "./badge";

export default {
  title: "Data display/Badge",
  component: Badge,
  parameters: { layout: "centered" },
  decorators: [
    (Story: any) => (
      <HopeWrapper>
        <Story />
      </HopeWrapper>
    ),
  ],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["solid", "subtle", "outline"],
    },
    colorScheme: {
      control: { type: "select" },
      options: ["primary", "neutral", "success", "info", "warning", "danger"],
    },
    children: {
      control: "text",
    },
  },
  args: {
    variant: "subtle",
    colorScheme: "primary",
    children: "Badge",
  },
};

export const Default = (args: any) => <Badge {...args} />;
Default.storyName = "Badge";
