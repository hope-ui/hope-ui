import {
  Alert,
  AlertDescription,
  Anchor,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  Input,
  ListItem,
  Radio,
  RadioControl,
  RadioGroup,
  RadioLabel,
  SimpleOption,
  SimpleSelect,
  Text,
  UnorderedList,
} from "@hope-ui/solid";
import Prism from "prismjs";
import { createSignal, JSX, onMount, Show } from "solid-js";

import Code from "@/components/Code";
import CodeSnippet from "@/components/CodeSnippet";
import { ContextualNavLink } from "@/components/ContextualNav";
import PageLayout from "@/components/PageLayout";
import PageTitle from "@/components/PageTitle";
import { Preview } from "@/components/Preview";
import { PropsTable, PropsTableItem } from "@/components/PropsTable";
import SectionSubtitle from "@/components/SectionSubtitle";
import SectionTitle from "@/components/SectionTitle";

import { FelteExample } from "./felte-example";
import { snippets } from "./snippets";

export default function FormControlDoc() {
  const [invalidInput, setInvalidInput] = createSignal("");

  const handleInvalidInput: JSX.EventHandlerUnion<HTMLInputElement, InputEvent> = event => {
    setInvalidInput((event.target as HTMLInputElement).value);
  };

  const isInvalid = () => invalidInput() === "";

  const previousLink: ContextualNavLink = {
    href: "/docs/data-entry/checkbox",
    label: "Checkbox",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/data-entry/input",
    label: "Input",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#import", label: "Import" },
    { href: "#usage", label: "Usage" },
    { href: "#required-field", label: "Requied field", indent: true },
    { href: "#disabled-field", label: "Disabled field", indent: true },
    { href: "#invalid-field", label: "Invalid field", indent: true },
    {
      href: "#usage-with-radio-or-checkbox-group",
      label: "Usage with radio or checkbox group",
      indent: true,
    },
    { href: "#usage-with-select", label: "Usage with select", indent: true },
    { href: "#usage-with-form-libraries", label: "Usage with form libraries" },
    { href: "#accessibility", label: "Accessibility" },
    { href: "#theming", label: "Theming" },
    { href: "#props", label: "Props" },
  ];

  const propItems: PropsTableItem[] = [
    {
      name: "id",
      description:
        "The custom `id` to use for the form control. This is passed directly to the form element (e.g, Input).",
      type: "string",
    },
    {
      name: "required",
      description:
        "If `true`, the form control will be required. The form element (e.g, Input) will have `aria-required` set to `true`.",
      type: "boolean",
    },
    {
      name: "disabled",
      description:
        "If `true`, the form control will be disabled. The `FormLabel` will have `data-disabled` attribute. The form element (e.g, Input) will be disabled.",
      type: "boolean",
    },
    {
      name: "invalid",
      description:
        "If `true`, the form control will be invalid. The `FormLabel` and `FormErrorMessage` will have `data-invalid` set to `true`. The form element (e.g, Input) will have `aria-invalid` set to `true`.",
      type: "boolean",
    },
    {
      name: "readOnly",
      description: "If `true`, the form control will be readonly.",
      type: "boolean",
    },
  ];

  onMount(() => {
    Prism.highlightAll();
  });

  return (
    <PageLayout previousLink={previousLink} nextLink={nextLink} contextualNavLinks={contextualNavLinks}>
      <PageTitle>FormControl</PageTitle>
      <Text mb="$5">
        FormControl provides context such as <Code>required</Code>, <Code>disabled</Code> and <Code>invalid</Code> to
        form elements. It follows the{" "}
        <Anchor href="https://www.w3.org/WAI/tutorials/forms/" external color="$primary11" fontWeight="$semibold">
          WAI specifications
        </Anchor>{" "}
        for forms.
      </Text>
      <SectionTitle id="import">Import</SectionTitle>
      <CodeSnippet snippet={snippets.importComponent} mb="$6" />
      <UnorderedList spacing="$2" mb="$12">
        <ListItem>
          <strong>FormControl:</strong> The wrapper that provides context and functionality for all children.
        </ListItem>
        <ListItem>
          <strong>FormLabel:</strong> The label of a form section. The usage is similar to html label.
        </ListItem>
        <ListItem>
          <strong>FormHelperText:</strong> The message that tells users more details about the form section.
        </ListItem>
        <ListItem>
          <strong>FormErrorMessage:</strong> The message that shows up when an error occurs.
        </ListItem>
      </UnorderedList>
      <SectionTitle id="usage">Usage</SectionTitle>
      <Preview snippet={snippets.basicUsage} mb="$10">
        <FormControl>
          <FormLabel for="email">Email address</FormLabel>
          <Input id="email" type="email" />
          <FormHelperText>We'll never share your email.</FormHelperText>
        </FormControl>
      </Preview>
      <SectionSubtitle id="required-field">Required field</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>required</Code> prop to make the form control required. The Input field will have{" "}
        <Code>aria-required</Code> set to <Code>true</Code>, and the <Code>FormLabel</Code> will show a red asterisk.
      </Text>
      <Preview snippet={snippets.required} mb="$10">
        <FormControl required>
          <FormLabel for="email">Email address</FormLabel>
          <Input id="email" type="email" />
          <FormHelperText>We'll never share your email.</FormHelperText>
        </FormControl>
      </Preview>
      <SectionSubtitle id="disabled-field">Disabled field</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>disabled</Code> prop to make the form control disabled.
      </Text>
      <Preview snippet={snippets.disabled} mb="$10">
        <FormControl disabled>
          <FormLabel for="email">Email address</FormLabel>
          <Input id="email" type="email" />
          <FormHelperText>We'll never share your email.</FormHelperText>
        </FormControl>
      </Preview>
      <SectionSubtitle id="invalid-field">Invalid field</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>invalid</Code> prop to make the form control invalid. the <Code>FormErrorMessage</Code> will only
        show up when the <Code>invalid</Code> prop is true.
      </Text>
      <Preview snippet={snippets.invalid} mb="$10">
        <FormControl invalid={isInvalid()}>
          <FormLabel for="email">Email address</FormLabel>
          <Input id="email" type="email" value={invalidInput()} onInput={handleInvalidInput} />
          <Show
            when={isInvalid()}
            fallback={<FormHelperText>Enter the email you'd like to receive the newsletter on.</FormHelperText>}
          >
            <FormErrorMessage>Email is required.</FormErrorMessage>
          </Show>
        </FormControl>
      </Preview>
      <SectionSubtitle id="usage-with-radio-or-checkbox-group">Usage with radio or checkbox group</SectionSubtitle>
      <Preview snippet={snippets.withRadioGroup} mb="$10">
        <FormControl as="fieldset">
          <FormLabel as="legend">Choose a framework</FormLabel>
          <RadioGroup defaultValue="solid">
            <HStack spacing="$6">
              <Radio value="react">
                <RadioControl />
                <RadioLabel>React</RadioLabel>
              </Radio>
              <Radio value="angular" disabled>
                <RadioControl />
                <RadioLabel>Angular</RadioLabel>
              </Radio>
              <Radio value="vue">
                <RadioControl />
                <RadioLabel>Vue</RadioLabel>
              </Radio>
              <Radio value="svelte">
                <RadioControl />
                <RadioLabel>Svelte</RadioLabel>
              </Radio>
              <Radio value="solid">
                <RadioControl />
                <RadioLabel>Solid</RadioLabel>
              </Radio>
            </HStack>
          </RadioGroup>
          <FormHelperText>You should choose Solid.</FormHelperText>
        </FormControl>
      </Preview>
      <SectionSubtitle id="usage-with-select">Usage with select</SectionSubtitle>
      <Preview snippet={snippets.withSelect} mb="$6">
        <FormControl>
          <FormLabel>Choose a framework</FormLabel>
          <SimpleSelect placeholder="Choose a framework">
            <SimpleOption value="react">React</SimpleOption>
            <SimpleOption value="angular" disabled>
              Angular
            </SimpleOption>
            <SimpleOption value="vue">Vue</SimpleOption>
            <SimpleOption value="svelte">Svelte</SimpleOption>
            <SimpleOption value="solid">Solid</SimpleOption>
          </SimpleSelect>
          <FormHelperText>You should choose Solid.</FormHelperText>
        </FormControl>
      </Preview>
      <Alert status="warning" mb="$12">
        <AlertDescription>
          You can also use the more composable <Code>Select</Code> component instead of <Code>SimpleSelect</Code>.
        </AlertDescription>
      </Alert>
      <SectionTitle id="usage-with-form-libraries">Usage with form libraries</SectionTitle>
      <Text mb="$5">
        The below example demonstrate the use of <Code>FormControl</Code> and others Hope UI form related components
        with the{" "}
        <Anchor href="https://felte.dev" external color="$primary11" fontWeight="$semibold">
          @felte/solid
        </Anchor>{" "}
        form library paired with{" "}
        <Anchor href="https://github.com/jquense/yup" external color="$primary11" fontWeight="$semibold">
          yup
        </Anchor>{" "}
        for object schema validation.
      </Text>
      <Preview snippet={snippets.usageWithFormLibraries} mb="$12">
        <FelteExample />
      </Preview>
      <SectionTitle id="accessibility">Accessibility</SectionTitle>
      <UnorderedList spacing="$2" mb="$8">
        <ListItem>
          <Code>id</Code> passed to the form control will be passed to the input directly.
        </ListItem>
        <ListItem>
          <Code>FormLabel</Code> will have <Code>for</Code> pointing to the <Code>id</Code> of the input.
        </ListItem>
        <ListItem>
          The input will have <Code>aria-describedby</Code> pointing to the <Code>id</Code> of the{" "}
          <Code>FormHelperText</Code>.
        </ListItem>
        <ListItem>
          When the field is invalid, the input will have <Code>aria-invalid</Code> set to <Code>true</Code> and{" "}
          <Code>aria-describedby</Code> pointing to the <Code>id</Code> of the <Code>FormErrorMessage</Code> first.
        </ListItem>
        <ListItem>
          <Code>required</Code>, <Code>disabled</Code>, <Code>invalid</Code> and <Code>readOnly</Code> props passed to{" "}
          <Code>FormControl</Code> will cascade across all related components.
        </ListItem>
      </UnorderedList>
      <UnorderedList spacing="$2" mb="$12">
        <ListItem>
          <Code>FormLabel</Code> is aware of the <Code>disabled</Code>, <Code>focused</Code> and <Code>invalid</Code>{" "}
          state of the input. This helps you style the label accordingly using the <Code>_disabled</Code>,{" "}
          <Code>_focus</Code>, and <Code>_invalid</Code> style props.
        </ListItem>
        <ListItem>
          <Code>FormErrorMessage</Code> only renders if <Code>invalid</Code> is set to <Code>true</Code>.
        </ListItem>
      </UnorderedList>
      <SectionTitle id="theming">Theming</SectionTitle>
      <Text mb="$5">
        <Code>FormControl</Code> base styles and default props can be overridden in the Hope UI theme configuration like
        below:
      </Text>
      <CodeSnippet lang="js" snippet={snippets.theming} mb="$12" />
      <SectionTitle id="props">Props</SectionTitle>
      <PropsTable items={propItems} />
    </PageLayout>
  );
}
