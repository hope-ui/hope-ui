import { HopeWrapper } from "@/utils/storybook";

import { Input } from "./input";

export default {
  title: "Data entry/Input",
  component: Input,
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
      options: ["outline", "filled", "flushed", "unstyled"],
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
    placeholder: {
      control: { type: "text" },
    },
  },
  args: {
    variant: "outline",
    size: "md",
    invalid: false,
    disabled: false,
    placeholder: "Placeholder",
  },
};

export const Default = (args: any) => <Input {...args} aria-invalid={args.invalid} />;
