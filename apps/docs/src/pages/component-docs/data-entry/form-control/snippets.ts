const importComponent = `import { 
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
} from "@hope-ui/solid"`;

const basicUsage = `<FormControl>
  <FormLabel for="email">Email address</FormLabel>
  <Input id="email" type="email" />
  <FormHelperText>We'll never share your email.</FormHelperText>
</FormControl>`;

const required = `<FormControl required>
  <FormLabel for="email">Email address</FormLabel>
  <Input id="email" type="email" />
  <FormHelperText>We'll never share your email.</FormHelperText>
</FormControl>`;

const disabled = `<FormControl disabled>
  <FormLabel for="email">Email address</FormLabel>
  <Input id="email" type="email" />
  <FormHelperText>We'll never share your email.</FormHelperText>
</FormControl>`;

const invalid = `function InvalidFieldExample() {
  const [value, setValue] = createSignal("")

  const handleInput = (e) => setValue(e.target.value)

  const isInvalid = () => value() === ""

  return (
    <FormControl invalid={isInvalid()}>
      <FormLabel for="email">Email address</FormLabel>
      <Input 
        id="email" 
        type="email" 
        value={value()} 
        onInput={handleInput} />
      <Show
        when={isInvalid()}
        fallback={
          <FormHelperText>
            Enter the email you'd like to receive the newsletter on.
          </FormHelperText>
        }
      >
        <FormErrorMessage>Email is required.</FormErrorMessage>
      </Show>
    </FormControl>
  )
}`;

const withRadioGroup = `<FormControl as="fieldset">
  <FormLabel as="legend">Choose a framework</FormLabel>
  <RadioGroup defaultValue="solid">
    <HStack spacing="$6">
      <Radio value="react">React</Radio>
      <Radio value="angular" disabled>Angular</Radio>
      <Radio value="vue">Vue</Radio>
      <Radio value="svelte">Svelte</Radio>
      <Radio value="solid">Solid</Radio>
    </HStack>
  </RadioGroup>
  <FormHelperText>You should choose Solid.</FormHelperText>
</FormControl>`;

const withSelect = `<FormControl>
  <FormLabel>Choose a framework</FormLabel>
  <SimpleSelect placeholder="Choose a framework">
    <SimpleOption value="react">React</SimpleOption>
    <SimpleOption value="angular" disabled>Angular</SimpleOption>
    <SimpleOption value="vue">Vue</SimpleOption>
    <SimpleOption value="svelte">Svelte</SimpleOption>
    <SimpleOption value="solid">Solid</SimpleOption>
  </SimpleSelect>
  <FormHelperText>You should choose Solid.</FormHelperText>
</FormControl>`;

const usageWithFormLibraries = `import { createForm } from "@felte/solid";
import { validator } from "@felte/validator-yup";
import {
  Button,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  Input,
  Radio,
  RadioGroup,
  SimpleOption,
  SimpleSelect,
  Textarea,
  VStack,
} from "@hope-ui/solid";
import { For, Show } from "solid-js";
import type { InferType } from "yup";
import { boolean, mixed, object, string } from "yup";

const schema = object({
  email: string().email().required(),
  jobTitle: string().required(),
  gender: mixed().oneOf(["male", "female", "other"]).required(),
  bio: string().max(30),
  subscribe: boolean(),
});

export function FelteExample() {
  const { 
    form, 
    errors, 
    data, 
    isValid, 
    setFields 
  } = createForm<InferType<typeof schema>>({
    extend: validator({ schema }),
    onSubmit: values => {
      console.log(values);
    },
  });

  return (
    <VStack 
      as="form" 
      ref={form} 
      spacing="$5" 
      alignItems="stretch" 
      maxW="$96" 
      mx="auto"
    >
      <FormControl required invalid={!!errors("email")}>
        <FormLabel>Email</FormLabel>
        <Input type="email" name="email" placeholder="contact@hope-ui.com" />
        <FormErrorMessage>{errors("email")[0]}</FormErrorMessage>
      </FormControl>
      <FormControl required invalid={!!errors("jobTitle")}>
        <FormLabel>Job title</FormLabel>
        <SimpleSelect
          placeholder="Choose a job title"
          onChange={value => setFields("jobTitle", value)}
        >
          <For each={["Designer", "Frontend developer", "Backend developer", "Devops"]}>
            {item => <SimpleOption value={item}>{item}</SimpleOption>}
          </For>
        </SimpleSelect>
        <FormErrorMessage>{errors("jobTitle")[0]}</FormErrorMessage>
      </FormControl>
      <FormControl as="fieldset" required invalid={!!errors("gender")}>
        <FormLabel as="legend">Gender</FormLabel>
        <RadioGroup name="gender">
          <HStack spacing="$5">
            <Radio value="male">Male</Radio>
            <Radio value="female">Female</Radio>
            <Radio value="other">Other</Radio>
          </HStack>
        </RadioGroup>
        <FormErrorMessage>{errors("gender")[0]}</FormErrorMessage>
      </FormControl>
      <FormControl invalid={!!errors("bio")}>
        <FormLabel>Bio</FormLabel>
        <Textarea name="bio" placeholder="Tell us something about yourself" />
        <Show
          when={errors("bio")}
          fallback={
            <FormHelperText w="$full" textAlign="end">
              {data("bio")?.length ?? 0}/30
            </FormHelperText>
          }
        >
          <FormErrorMessage>{errors("bio")[0]}</FormErrorMessage>
        </Show>
      </FormControl>
      <Checkbox name="subscribe">Subscribe to the newsletter</Checkbox>
      <HStack justifyContent="flex-end">
        <Button type="submit" disabled={!isValid()}>
          Submit
        </Button>
      </HStack>
    </VStack>
  );
}`;

const theming = `const config: HopeThemeConfig = {
  components: {
    FormControl: {
      baseStyle: {
        root: SystemStyleObject,
        label: SystemStyleObject,
        helperText: SystemStyleObject,
        errorMessage: SystemStyleObject,
      },
      defaultProps: {
        label: FormLabelOptions
      }
    }
  }
}`;

export const snippets = {
  importComponent,
  basicUsage,
  required,
  disabled,
  invalid,
  withRadioGroup,
  withSelect,
  usageWithFormLibraries,
  theming,
};
