import { HopeWrapper } from "@/utils/storybook";

import { Icon, IconSearch } from "..";
import { VStack } from "../stack";
import { InputLeftAddon, InputLeftElement, InputRightAddon, InputRightElement } from ".";
import { Input } from "./input";
import { InputGroup } from "./input-group";

function MdiPhoneIcon() {
  return (
    <Icon color="$neutral9">
      <path
        d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.28-.28.67-.36 1.02-.25c1.12.37 2.32.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57c.11.35.03.74-.25 1.02l-2.2 2.2z"
        fill="currentColor"
      ></path>
    </Icon>
  );
}

function MdiCheckIcon() {
  return (
    <Icon color="$success9">
      <path d="M21 7L9 19l-5.5-5.5l1.41-1.41L9 16.17L19.59 5.59L21 7z" fill="currentColor"></path>
    </Icon>
  );
}

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
      options: ["outline", "filled", "unstyled"],
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

export const Default = (args: any) => (
  <Input
    variant={args.variant}
    size={args.size}
    placeholder={args.placeholder}
    disabled={args.disabled}
    aria-invalid={args.invalid}
  />
);

export const WithElement = (args: any) => (
  <VStack spacing="$4">
    <InputGroup variant={args.variant} size={args.size}>
      <InputLeftElement pointerEvents="none">
        <MdiPhoneIcon />
      </InputLeftElement>
      <Input placeholder={args.placeholder} disabled={args.disabled} aria-invalid={args.invalid} />
    </InputGroup>
    <InputGroup variant={args.variant} size={args.size}>
      <Input placeholder={args.placeholder} disabled={args.disabled} aria-invalid={args.invalid} />
      <InputRightElement pointerEvents="none">
        <MdiCheckIcon />
      </InputRightElement>
    </InputGroup>
    <InputGroup variant={args.variant} size={args.size}>
      <InputLeftElement pointerEvents="none">
        <MdiPhoneIcon />
      </InputLeftElement>
      <Input placeholder={args.placeholder} disabled={args.disabled} aria-invalid={args.invalid} />
      <InputRightElement pointerEvents="none">
        <MdiCheckIcon />
      </InputRightElement>
    </InputGroup>
  </VStack>
);
WithElement.storyName = "With element";

export const WithAddon = (args: any) => (
  <VStack spacing="$4">
    <InputGroup variant={args.variant} size={args.size}>
      <InputLeftAddon>+33</InputLeftAddon>
      <Input placeholder={args.placeholder} disabled={args.disabled} aria-invalid={args.invalid} />
    </InputGroup>
    <InputGroup variant={args.variant} size={args.size}>
      <Input placeholder={args.placeholder} disabled={args.disabled} aria-invalid={args.invalid} />
      <InputRightAddon>
        <IconSearch />
      </InputRightAddon>
    </InputGroup>
    <InputGroup variant={args.variant} size={args.size}>
      <InputLeftAddon>http://</InputLeftAddon>
      <Input placeholder={args.placeholder} disabled={args.disabled} aria-invalid={args.invalid} />
      <InputRightAddon>.com</InputRightAddon>
    </InputGroup>
  </VStack>
);
WithAddon.storyName = "With addon";
