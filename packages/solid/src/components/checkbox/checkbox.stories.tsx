import { createSignal } from "solid-js";

import { Button } from "..";
import { HStack, VStack } from "../stack/stack";
import { HopeWrapper } from "../storybook-utils";
import { Checkbox } from "./checkbox";
import { CheckboxControl } from "./checkbox-control";
import { CheckboxGroup } from "./checkbox-group";
import { CheckboxLabel } from "./checkbox-label";

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
      <Button onClick={() => setChecked(prev => !prev)}>Toggle controlled checkbox ({checked().toString()})</Button>
      <HStack spacing="$5">
        <Checkbox {...args} checked={checked()} onChange={onChange}>
          <CheckboxControl />
          <CheckboxLabel>Controlled</CheckboxLabel>
        </Checkbox>
        <Checkbox {...args}>
          <CheckboxControl />
          <CheckboxLabel>Uncontrolled</CheckboxLabel>
        </Checkbox>
      </HStack>
    </VStack>
  );
};

export const WithCheckboxGroup = (args: any) => {
  const [fruits, setFruits] = createSignal(["orange"]);

  const onChange = (value: string[]) => {
    setFruits(value);
  };

  return (
    <VStack spacing="$5">
      <Button onClick={() => setFruits(["apple"])}>Select Apple (current: {JSON.stringify(fruits())})</Button>
      <CheckboxGroup name="fruit" onChange={onChange} value={fruits()} {...args}>
        <HStack spacing="$5">
          <Checkbox value="peach">
            <CheckboxControl />
            <CheckboxLabel>Peach</CheckboxLabel>
          </Checkbox>
          <Checkbox value="apple">
            <CheckboxControl />
            <CheckboxLabel>Apple</CheckboxLabel>
          </Checkbox>
          <Checkbox value="orange">
            <CheckboxControl />
            <CheckboxLabel>Orange</CheckboxLabel>
          </Checkbox>
        </HStack>
      </CheckboxGroup>
      <CheckboxGroup defaultValue={["apple"]} {...args}>
        <HStack spacing="$5">
          <Checkbox value="peach">
            <CheckboxControl />
            <CheckboxLabel>Peach</CheckboxLabel>
          </Checkbox>
          <Checkbox value="apple">
            <CheckboxControl />
            <CheckboxLabel>Apple</CheckboxLabel>
          </Checkbox>
          <Checkbox value="orange">
            <CheckboxControl />
            <CheckboxLabel>Orange</CheckboxLabel>
          </Checkbox>
        </HStack>
      </CheckboxGroup>
    </VStack>
  );
};
WithCheckboxGroup.storyName = "With CheckboxGroup";
