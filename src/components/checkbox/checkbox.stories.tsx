import { HopeWrapper } from "@/utils/storybook";

import { Checkbox } from "./checkbox";

export default {
  title: "Data entry/Checkbox",
  component: Checkbox,
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
      options: ["outline", "filled"],
    },
    colorScheme: {
      control: { type: "select" },
      options: ["primary", "neutral", "success", "info", "warning", "danger"],
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
    },
    labelPosition: {
      control: { type: "select" },
      options: ["left", "right"],
    },
    checked: {
      control: { type: "boolean" },
    },
    indeterminate: {
      control: { type: "boolean" },
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
    children: {
      control: { type: "text" },
    },
  },
  args: {
    variant: "outline",
    colorScheme: "primary",
    size: "md",
    labelPosition: "right",
    checked: false,
    indeterminate: false,
    invalid: false,
    disabled: false,
    required: false,
    readOnly: false,
    children: "Checkbox",
  },
};

export const Default = (args: any) => <Checkbox {...args} />;
Default.storyName = "Checkbox";
