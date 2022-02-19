import { createSignal } from "solid-js";

import { HopeWrapper } from "@/utils/storybook";

import { Button } from "..";
import { HStack, VStack } from "../stack/stack";
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
  },
};

export const Default = (args: any) => {
  const [checked, setChecked] = createSignal(false);

  const onChange = (event: Event) => {
    setChecked((event.target as HTMLInputElement).checked);
  };

  return (
    <VStack spacing="$5">
      <Button onClick={() => setChecked(prev => !prev)}>
        Toggle controlled checkbox ({checked().toString()})
      </Button>
      <HStack spacing="$5">
        <Checkbox {...args} checked={checked()} onChange={onChange}>
          Controlled
        </Checkbox>
        <Checkbox {...args}>Uncontrolled</Checkbox>
      </HStack>
    </VStack>
  );
};
Default.storyName = "Checkbox";
