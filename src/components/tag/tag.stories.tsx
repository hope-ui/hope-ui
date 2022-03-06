import { action } from "@storybook/addon-actions";

import { HopeWrapper } from "@/utils/storybook";

import { IconInfoCircle } from "../icons/IconInfoCircle";
import { HStack } from "../stack/stack";
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

export const WithIcon = (args: any) => (
  <HStack spacing="$4">
    <Tag {...args}>
      <Tag.LeftIcon as={IconInfoCircle} />
      <Tag.Label>Tag</Tag.Label>
    </Tag>
    <Tag {...args}>
      <Tag.Label>Tag</Tag.Label>
      <Tag.RightIcon as={IconInfoCircle} />
    </Tag>
  </HStack>
);
WithIcon.storyName = "With icon";

export const WithCloseButton = (args: any) => (
  <Tag {...args}>
    <Tag.Label>Tag</Tag.Label>
    <Tag.CloseButton onClick={action("clicked close button")} />
  </Tag>
);
WithCloseButton.storyName = "With close button";
WithCloseButton.args = { children: "Close" };
