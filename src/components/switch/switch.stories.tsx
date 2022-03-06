import { createSignal } from "solid-js";

import { HopeWrapper } from "@/utils/storybook";

import { Button } from "..";
import { HStack, VStack } from "../stack/stack";
import { Switch } from "./switch";

export default {
  title: "Data entry/Switch",
  component: Switch,
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
    variant: "filled",
    colorScheme: "primary",
    size: "md",
    labelPlacement: "start",
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
      <Button onClick={() => setChecked(prev => !prev)}>Toggle controlled switch ({checked().toString()})</Button>
      <HStack spacing="$5">
        <Switch {...args} checked={checked()} onChange={onChange}>
          Controlled
        </Switch>
        <Switch {...args}>Uncontrolled</Switch>
      </HStack>
    </VStack>
  );
};
Default.storyName = "Switch";
