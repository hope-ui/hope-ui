import { HopeProvider } from "@/contexts";
import { IconInfoCircle } from "@/icons";

import { Tag } from "./Tag";

export default {
  title: "Data display/Tag",
  component: Tag,
  parameters: { layout: "centered" },
  decorators: [
    (Story: any) => (
      <HopeProvider>
        <div style={{ display: "flex", "justify-content": "center", width: "90vw" }}>
          <Story />
        </div>
      </HopeProvider>
    ),
  ],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["filled", "light", "outline", "dot"],
    },
    color: {
      control: { type: "select" },
      options: ["primary", "dark", "neutral", "success", "info", "warning", "danger"],
    },
    size: {
      control: { type: "select" },
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    radius: {
      control: { type: "select" },
      options: ["none", "xs", "sm", "md", "lg", "xl", "full"],
    },
    fullWidth: {
      control: { type: "boolean" },
    },
    children: {
      control: "text",
    },
  },
  args: {
    variant: "light",
    color: "primary",
    size: "sm",
    radius: "full",
    fullWidth: false,
    children: "Tag",
  },
};

export const Default = (args: any) => <Tag {...args} />;

export const WithLeftSection = (args: any) => <Tag leftSection={<IconInfoCircle />} {...args} />;
WithLeftSection.storyName = "With left section";
WithLeftSection.args = { children: "Informations" };

export const WithRightSection = (args: any) => <Tag rightSection={<IconInfoCircle />} {...args} />;
WithRightSection.storyName = "With right section";
WithRightSection.args = { children: "Informations" };
