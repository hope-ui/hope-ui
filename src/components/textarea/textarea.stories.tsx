import { HopeWrapper } from "@/utils/storybook";

import { Textarea } from "./textarea";

export default {
  title: "Data entry/Textarea",
  component: Textarea,
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
      options: ["outline", "filled", "unstyled"],
    },
    size: {
      control: { type: "select" },
      options: ["xs", "sm", "md", "lg"],
    },
    invalid: {
      control: { type: "boolean" },
    },
    disabled: {
      control: { type: "boolean" },
    },
    required: {
      control: { type: "boolean" },
    },
    readOnly: {
      control: { type: "boolean" },
    },
    placeholder: {
      control: { type: "text" },
    },
  },
  args: {
    variant: "outline",
    size: "md",
    invalid: false,
    disabled: false,
    required: false,
    readOnly: false,
    placeholder: "Placeholder",
  },
};

export const Default = (args: any) => <Textarea {...args} />;
Default.storyName = "Textarea";
