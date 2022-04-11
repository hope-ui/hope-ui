import { createSignal } from "solid-js";

import { Button, RadioGroup } from "..";
import { HStack, VStack } from "../stack/stack";
import { HopeWrapper } from "../storybook-utils";
import { Radio } from "./radio";

export default {
  title: "Data entry/Radio",
  component: Radio,
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
    labelPlacement: {
      control: { type: "select" },
      options: ["start", "end"],
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
    labelPlacement: "end",
    invalid: false,
    disabled: false,
    required: false,
    readOnly: false,
  },
};

export const Default = (args: any) => {
  const [fruit, setFruit] = createSignal("");

  const onChange = (event: Event) => {
    setFruit((event.target as HTMLInputElement).value);
  };

  return (
    <VStack spacing="$5">
      <Button onClick={() => setFruit("apple")}>Select Apple (current: {fruit()})</Button>
      <HStack spacing="$5">
        <Radio name="fruit" value="peach" checked={fruit() === "peach"} onChange={onChange} {...args}>
          Peach
        </Radio>
        <Radio name="fruit" value="apple" checked={fruit() === "apple"} onChange={onChange} {...args}>
          Apple
        </Radio>
        <Radio name="fruit" value="orange" checked={fruit() === "orange"} onChange={onChange} {...args}>
          Orange
        </Radio>
      </HStack>
    </VStack>
  );
};

export const WithRadioGroup = (args: any) => {
  const [fruit, setFruit] = createSignal("orange");

  const onChange = (value: string) => {
    setFruit(value);
  };

  return (
    <VStack spacing="$5">
      <Button onClick={() => setFruit("apple")}>Select Apple (current: {fruit()})</Button>
      <RadioGroup name="fruit" onChange={onChange} value={fruit()} {...args}>
        <HStack spacing="$5">
          <Radio value="peach">Peach</Radio>
          <Radio value="apple">Apple</Radio>
          <Radio value="orange">Orange</Radio>
        </HStack>
      </RadioGroup>
      <RadioGroup defaultValue="apple" {...args}>
        <HStack spacing="$5">
          <Radio value="peach">Peach</Radio>
          <Radio value="apple">Apple</Radio>
          <Radio value="orange">Orange</Radio>
        </HStack>
      </RadioGroup>
    </VStack>
  );
};
WithRadioGroup.storyName = "With RadioGroup";
