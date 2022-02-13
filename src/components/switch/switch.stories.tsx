import { createSignal } from "solid-js";

import { HopeWrapper } from "@/utils/storybook";

import { Button, createIcon } from "..";
import { HStack, VStack } from "../stack/stack";
import { Switch } from "./switch";

const IconSunSolid = createIcon({
  viewBox: "0 0 20 20",
  path: () => (
    <g fill="currentColor">
      <path
        fill-rule="evenodd"
        d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
        clip-rule="evenodd"
      />
    </g>
  ),
});

const IconMoonSolid = createIcon({
  viewBox: "0 0 20 20",
  path: () => (
    <g fill="currentColor">
      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
    </g>
  ),
});

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
    labelPosition: {
      control: { type: "select" },
      options: ["left", "right"],
    },
    checked: {
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
    variant: "filled",
    colorScheme: "primary",
    size: "md",
    labelPosition: "left",
    checked: false,
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
        Toggle controlled switch ({checked().toString()})
      </Button>
      <HStack spacing="$5">
        <Switch {...args} checked={checked()} onChange={onChange}>
          Controlled
        </Switch>
        <Switch {...args}>Uncontrolled</Switch>
      </HStack>
    </VStack>
  );
};

export const WithIcon = (args: any) => {
  return (
    <VStack spacing="$5" alignItems="flex-end">
      <Switch {...args} iconOn={<IconMoonSolid />}>
        Icon On
      </Switch>
      <Switch {...args} iconOff={<IconSunSolid />}>
        Icon Off
      </Switch>
      <Switch {...args} iconOn={<IconMoonSolid />} iconOff={<IconSunSolid />}>
        Icon Both
      </Switch>
    </VStack>
  );
};
WithIcon.storyName = "With icon";
