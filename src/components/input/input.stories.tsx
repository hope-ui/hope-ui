import { HopeWrapper } from "@/utils/storybook";

import { IconCheckCircle } from "..";
import { VStack } from "../stack";
import { InputLeftElement, InputRightElement } from ".";
import { Input } from "./input";
import { InputGroup } from "./input-group";

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

export const WithElement = (args: any) => (
  <VStack spacing="$4">
    <InputGroup size={args.size}>
      <InputLeftElement>
        <IconCheckCircle />
      </InputLeftElement>
      <Input
        variant={args.variant}
        disabled={args.disabled}
        placeholder={args.placeholder}
        aria-invalid={args.invalid}
      />
    </InputGroup>
    <InputGroup size={args.size}>
      <Input
        variant={args.variant}
        disabled={args.disabled}
        placeholder={args.placeholder}
        aria-invalid={args.invalid}
      />
      <InputRightElement>
        <IconCheckCircle />
      </InputRightElement>
    </InputGroup>
    <InputGroup size={args.size}>
      <InputLeftElement>
        <IconCheckCircle />
      </InputLeftElement>
      <Input
        variant={args.variant}
        disabled={args.disabled}
        placeholder={args.placeholder}
        aria-invalid={args.invalid}
      />
      <InputRightElement>
        <IconCheckCircle />
      </InputRightElement>
    </InputGroup>
  </VStack>
);
WithElement.storyName = "With element";

export const WithAddon = (args: any) => (
  <InputGroup>
    <Input />
  </InputGroup>
);
WithAddon.storyName = "With addon";
