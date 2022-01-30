import { action } from "@storybook/addon-actions";

import { TagCloseButton } from "@/components/Tag/TagCloseButton";
import { IconInfoCircle } from "@/icons";
import { HopeProvider } from "@/theme/HopeProvider";

import { Tag } from "./Tag";

export default {
  title: "Data display/Tag",
  component: Tag,
  parameters: { layout: "centered", backgrounds: { default: "white" } },
  decorators: [
    (Story: any) => (
      <HopeProvider>
        <Story />
      </HopeProvider>
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
    borderRadius: {
      control: { type: "select" },
      options: ["none", "xs", "sm", "md", "lg", "xl", "2xl", "3xl", "full"],
    },
    children: {
      control: "text",
    },
  },
  args: {
    variant: "subtle",
    colorScheme: "primary",
    size: "sm",
    borderRadius: "full",
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
