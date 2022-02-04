import { action } from "@storybook/addon-actions";

import { TagCloseButton } from "@/components/tag/tag-close-button";
import { IconInfoCircle } from "@/icons";
import { HopeWrapper } from "@/utils/storybook";

import { Tag } from "./tag";

export default {
  title: "Data display/Tag",
  component: Tag,
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
      options: ["solid", "subtle", "outline", "dot"],
    },
    colorScheme: {
      control: { type: "select" },
      options: ["primary", "neutral", "success", "info", "warning", "danger"],
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
    },
    children: {
      control: "text",
    },
  },
  args: {
    variant: "subtle",
    colorScheme: "primary",
    size: "sm",
    children: "Tag",
  },
};

export const Default = (args: any) => <Tag {...args} />;

export const WithLeftSection = (args: any) => <Tag leftSection={<IconInfoCircle />} {...args} />;
WithLeftSection.storyName = "With left section";

export const WithRightSection = (args: any) => <Tag rightSection={<IconInfoCircle />} {...args} />;
WithRightSection.storyName = "With right section";

export const WithBothSection = (args: any) => (
  <Tag leftSection={<IconInfoCircle />} rightSection={<IconInfoCircle />} {...args} />
);
WithBothSection.storyName = "With both section";
WithBothSection.args = { children: "Please don't do that..." };

export const WithCloseButton = (args: any) => (
  <Tag
    rightSection={<TagCloseButton aria-label="Close" onClick={action("clicked close button")} />}
    {...args}
  />
);
WithCloseButton.storyName = "With close button";
WithCloseButton.args = { children: "Close" };
