import type { Meta, StoryObj } from "@storybook/html";
import type { ComponentProps } from "solid-js";

import { Counter, CounterProps } from "./counter";

type Story = StoryObj<CounterProps>;

export const Default: Story = {
  args: {
    initialValue: 12,
    theme: "default",
  },
};

export default {
  title: "Example/Counter",
  tags: ["autodocs"],
  render: props => <Counter {...props} />,
  argTypes: {
    initialValue: { control: "number" },
    theme: {
      options: ["default", "red"],
      control: { type: "radio" },
    },
  },
} as Meta<ComponentProps<typeof Counter>>;
