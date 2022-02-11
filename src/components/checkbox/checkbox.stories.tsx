import { createSignal } from "solid-js";

import { HopeWrapper } from "@/utils/storybook";

import { HStack } from "../stack/stack";
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
  },
  args: {
    variant: "outline",
    colorScheme: "primary",
    size: "md",
    labelPosition: "right",
    indeterminate: false,
    invalid: false,
    disabled: false,
    required: false,
    readOnly: false,
  },
};

export const Default = (args: any) => {
  const [checked, setChecked] = createSignal(false);

  const onChange = (event: Event) => {
    setChecked((event.target as HTMLInputElement).checked);
  };

  return (
    <HStack spacing="$5">
      <Checkbox checked={checked()} onChange={onChange} {...args}>
        Controlled
      </Checkbox>
      <Checkbox {...args}>Uncontrolled</Checkbox>
    </HStack>
  );
};
Default.storyName = "Checkbox";
