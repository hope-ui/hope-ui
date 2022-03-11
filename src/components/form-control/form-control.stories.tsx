import { For, Show } from "solid-js";

import { HopeWrapper } from "@/utils/storybook";

import { Input } from "../input/input";
import { Textarea } from "../textarea/textarea";
import { FormControl } from "./form-control";
import { FormErrorMessage } from "./form-error-message";
import { FormHelperText } from "./form-helper-text";
import { FormLabel } from "./form-label";
import { Select } from "../select/select";

export default {
  title: "Data entry/FormControl",
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
    required: {
      control: { type: "boolean" },
    },
    disabled: {
      control: { type: "boolean" },
    },
    invalid: {
      control: { type: "boolean" },
    },
    readOnly: {
      control: { type: "boolean" },
    },
  },
  args: {
    required: false,
    disabled: false,
    invalid: false,
    readOnly: false,
  },
};

export const WithInput = (args: any) => (
  <FormControl maxW={300} {...args}>
    <FormLabel>Email address</FormLabel>
    <Input type="email" placeholder="Placeholder" />
    <Show when={args.invalid} fallback={<FormHelperText>We'll never share your email.</FormHelperText>}>
      <FormErrorMessage>An error occured</FormErrorMessage>
    </Show>
  </FormControl>
);
WithInput.storyName = "With input";

export const WithTextarea = (args: any) => (
  <FormControl {...args}>
    <FormLabel>Description</FormLabel>
    <Textarea resize="vertical" placeholder="Placeholder" />
    <Show when={args.invalid} fallback={<FormHelperText>Max 300 characters.</FormHelperText>}>
      <FormErrorMessage>An error occured</FormErrorMessage>
    </Show>
  </FormControl>
);
WithTextarea.storyName = "With textarea";

export const WithSelect = (args: any) => (
  <FormControl {...args}>
    <FormLabel>Framework</FormLabel>
    <Select>
      <Select.Trigger maxW="300px">
        <Select.Placeholder>Choose a framework</Select.Placeholder>
        <Select.Value />
        <Select.Icon />
      </Select.Trigger>
      <Select.Content>
        <Select.Listbox>
          <For each={["React", "Angular", "Vue", "Svelte", "Solid"]}>
            {item => (
              <Select.Option value={item}>
                <Select.OptionText>{item}</Select.OptionText>
                <Select.OptionIndicator />
              </Select.Option>
            )}
          </For>
        </Select.Listbox>
      </Select.Content>
    </Select>
    <Show when={args.invalid} fallback={<FormHelperText>Choose SolidJS.</FormHelperText>}>
      <FormErrorMessage>An error occured</FormErrorMessage>
    </Show>
  </FormControl>
);
WithSelect.storyName = "With select";
