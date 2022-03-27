import { For, Show } from "solid-js";

import { HopeWrapper } from "@/utils/storybook";

import { Input } from "../input/input";
import {
  Select,
  SelectContent,
  SelectIcon,
  SelectListbox,
  SelectOption,
  SelectOptionIndicator,
  SelectOptionText,
  SelectPlaceholder,
  SelectTrigger,
  SelectValue,
} from "../select";
import { Textarea } from "../textarea/textarea";
import { FormControl } from "./form-control";
import { FormErrorMessage } from "./form-error-message";
import { FormHelperText } from "./form-helper-text";
import { FormLabel } from "./form-label";

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
      <SelectTrigger maxW="300px">
        <SelectPlaceholder>Choose a framework</SelectPlaceholder>
        <SelectValue />
        <SelectIcon />
      </SelectTrigger>
      <SelectContent>
        <SelectListbox>
          <For each={["React", "Angular", "Vue", "Svelte", "Solid"]}>
            {item => (
              <SelectOption value={item}>
                <SelectOptionText>{item}</SelectOptionText>
                <SelectOptionIndicator />
              </SelectOption>
            )}
          </For>
        </SelectListbox>
      </SelectContent>
    </Select>
    <Show when={args.invalid} fallback={<FormHelperText>Choose SolidJS.</FormHelperText>}>
      <FormErrorMessage>An error occured</FormErrorMessage>
    </Show>
  </FormControl>
);
WithSelect.storyName = "With select";
