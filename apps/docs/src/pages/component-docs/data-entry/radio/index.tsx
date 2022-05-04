import { HStack, ListItem, Radio, RadioGroup, Text, UnorderedList } from "@hope-ui/solid";
import Prism from "prismjs";
import { onMount } from "solid-js";

import Code from "@/components/Code";
import CodeSnippet from "@/components/CodeSnippet";
import { ContextualNavLink } from "@/components/ContextualNav";
import PageLayout from "@/components/PageLayout";
import PageTitle from "@/components/PageTitle";
import { Preview } from "@/components/Preview";
import { PropsTable, PropsTableItem } from "@/components/PropsTable";
import SectionSubtitle from "@/components/SectionSubtitle";
import SectionTitle from "@/components/SectionTitle";

import { snippets } from "./snippets";

export default function RadioDoc() {
  const plans = [
    {
      id: 1,
      name: "Startup",
      ram: "12GB",
      cpus: "6 CPUs",
      disk: "160 GB SSD disk",
    },
    {
      id: 2,
      name: "Business",
      ram: "16GB",
      cpus: "8 CPUs",
      disk: "512 GB SSD disk",
    },
    {
      id: 3,
      name: "Enterprise",
      ram: "32GB",
      cpus: "12 CPUs",
      disk: "1024 GB SSD disk",
    },
  ];

  const previousLink: ContextualNavLink = {
    href: "/docs/data-entry/form-control",
    label: "FormControl",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/data-entry/select",
    label: "Select",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#import", label: "Import" },
    { href: "#usage", label: "Usage" },
    { href: "#colors", label: "Radio colors", indent: true },
    { href: "#sizes", label: "Radio sizes", indent: true },
    { href: "#variants", label: "Radio variants", indent: true },
    { href: "#label-placement", label: "Radio label placement", indent: true },
    { href: "#disabled", label: "Disabled state", indent: true },
    { href: "#invalid", label: "Invalid state", indent: true },
    { href: "#name-prop", label: "Note about `name` prop", indent: true },
    { href: "#theming", label: "Theming" },
    { href: "#props", label: "Props" },
    { href: "#radio-props", label: "Radio props", indent: true },
    { href: "#radio-group-props", label: "RadioGroup props", indent: true },
  ];

  const radioPropItems: PropsTableItem[] = [
    {
      name: "variant",
      description: "The visual style of the radio.",
      type: '"outline" | "filled"',
      defaultValue: '"outline"',
    },
    {
      name: "colorScheme",
      description: "The color of the radio.",
      type: '"primary" | "accent" | "neutral" | "success" | "info" | "warning" | "danger"',
      defaultValue: '"primary"',
    },
    {
      name: "size",
      description: "The size of the radio.",
      type: '"sm" | "md" | "lg"',
      defaultValue: '"md"',
    },
    {
      name: "labelPlacement",
      description: "The placement of the radio label.",
      type: '"start" | "end"',
      defaultValue: '"end"',
    },
    {
      name: "name",
      description: "The name of the input field in a radio (Useful for form submission).",
      type: "string",
    },
    {
      name: "value",
      description:
        "The value to be used in the radio input. This is the value that will be returned on form submission.",
      type: "string | number",
    },
    {
      name: "checked",
      description:
        "If `true`, the radio will be checked. You'll need to pass `onChange` to update its value (since it is now controlled).",
      type: "boolean",
    },
    {
      name: "defaultChecked",
      description: "If `true`, the radio will be initially checked.",
      type: "boolean",
    },
    {
      name: "required",
      description:
        "If `true`, the radio is marked as required, and `required` attribute will be added",
      type: "boolean",
    },
    {
      name: "disabled",
      description: "If `true`, the radio will be disabled.",
      type: "boolean",
    },
    {
      name: "invalid",
      description: "If `true`, the radio will have `aria-invalid` set to `true`.",
      type: "boolean",
    },
    {
      name: "readOnly",
      description: "If `true`, the radio will be readonly.",
      type: "boolean",
    },
    {
      name: "children",
      description:
        "The children of the radio. If used as a render props, the `checked` state will be passed.",
      type: "JSX.Element | (props: { checked: boolean }) => JSX.Element",
    },
    {
      name: "onChange",
      description: "The callback invoked when the checked state of the `Radio` changes.",
      type: "JSX.EventHandlerUnion<HTMLInputElement, Event>",
    },
    {
      name: "onFocus",
      description: "The callback invoked when the radio is focused.",
      type: "JSX.EventHandlerUnion<HTMLInputElement, FocusEvent>",
    },
    {
      name: "onBlur",
      description: "The callback invoked when the radio is blurred (loses focus).",
      type: "JSX.EventHandlerUnion<HTMLInputElement, FocusEvent>",
    },
  ];

  const radioGroupPropItems: PropsTableItem[] = [
    {
      name: "variant",
      description: "The visual style of the radios.",
      type: '"outline" | "filled"',
      defaultValue: '"outline"',
    },
    {
      name: "colorScheme",
      description: "The color of the radios.",
      type: '"primary" | "accent" | "neutral" | "success" | "info" | "warning" | "danger"',
      defaultValue: '"primary"',
    },
    {
      name: "size",
      description: "The size of the radios.",
      type: '"sm" | "md" | "lg"',
      defaultValue: '"md"',
    },
    {
      name: "labelPlacement",
      description: "The placement of the radios labels.",
      type: '"start" | "end"',
      defaultValue: '"end"',
    },
    {
      name: "name",
      description: "The `name` attribute forwarded to each `radio` element.",
      type: "string",
    },
    {
      name: "value",
      description: "The value of the radio to be `checked` (in controlled mode).",
      type: "string | number",
    },
    {
      name: "defaultValue",
      description: "The value of the radio to be `checked` initially (in uncontrolled mode).",
      type: "string | number",
    },
    {
      name: "required",
      description:
        "If `true`, all wrapped radio inputs will be marked as required, and `required` attribute will be added.",
      type: "boolean",
    },
    {
      name: "disabled",
      description: "If `true`, all wrapped radio inputs will be disabled.",
      type: "boolean",
    },
    {
      name: "invalid",
      description: "If `true`, all wrapped radio inputs will have `aria-invalid` set to `true`.",
      type: "boolean",
    },
    {
      name: "readOnly",
      description: "If `true`, all wrapped radio inputs will be readonly.",
      type: "boolean",
    },
    {
      name: "onChange",
      description: "The callback invoked when a radio is checked.",
      type: "(value: string | number) => void",
    },
  ];

  onMount(() => {
    Prism.highlightAll();
  });

  return (
    <PageLayout
      previousLink={previousLink}
      nextLink={nextLink}
      contextualNavLinks={contextualNavLinks}
    >
      <PageTitle>Radio</PageTitle>
      <Text mb="$5">
        Radios are used when only one choice may be selected in a series of options.
      </Text>
      <SectionTitle id="import">Import</SectionTitle>
      <CodeSnippet snippet={snippets.importComponent} mb="$6" />
      <UnorderedList spacing="$2" mb="$12">
        <ListItem>
          <strong>Radio:</strong> Provides context for all its children. It renders a{" "}
          <Code>label</Code> and a visualy hidden <Code>input</Code> with type set to{" "}
          <Code>radio</Code>.
        </ListItem>
        <ListItem>
          <strong>RadioGroup:</strong> Component to help manage the checked state of its children{" "}
          <Code>Radio</Code> components and conveniently pass a few shared style props to each.
        </ListItem>
      </UnorderedList>
      <SectionTitle id="usage">Usage</SectionTitle>
      <Preview snippet={snippets.basicUsage} mb="$12">
        <RadioGroup defaultValue="1">
          <HStack spacing="$4">
            <Radio value="1">First</Radio>
            <Radio value="2">Second</Radio>
            <Radio value="3">Third</Radio>
          </HStack>
        </RadioGroup>
      </Preview>
      <SectionSubtitle id="colors">Radio colors</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>colorScheme</Code> prop to change the color of the Radio. You can set the
        value to <Code>primary</Code>, <Code>accent</Code>, <Code>neutral</Code>,{" "}
        <Code>success</Code>, <Code>info</Code>, <Code>warning</Code> or <Code>danger</Code>.
      </Text>
      <Preview snippet={snippets.radioColors} mb="$10">
        <HStack spacing="$4">
          <Radio defaultChecked colorScheme="primary" />
          <Radio defaultChecked colorScheme="accent" />
          <Radio defaultChecked colorScheme="neutral" />
          <Radio defaultChecked colorScheme="success" />
          <Radio defaultChecked colorScheme="info" />
          <Radio defaultChecked colorScheme="warning" />
          <Radio defaultChecked colorScheme="danger" />
        </HStack>
      </Preview>
      <SectionSubtitle id="sizes">Radio sizes</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>size</Code> prop to change the size of the Radio. You can set the value to{" "}
        <Code>sm</Code>, <Code>md</Code> or <Code>lg</Code>.
      </Text>
      <Preview snippet={snippets.radioSizes} mb="$10">
        <HStack spacing="$4">
          <Radio defaultChecked size="sm">
            Radio
          </Radio>
          <Radio defaultChecked size="md">
            Radio
          </Radio>
          <Radio defaultChecked size="lg">
            Radio
          </Radio>
        </HStack>
      </Preview>
      <SectionSubtitle id="variants">Radio variants</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>variant</Code> prop to change the visual style of the Radio. You can set the
        value to <Code>outline</Code> or <Code>filled</Code>.
      </Text>
      <Preview snippet={snippets.radioVariants} mb="$10">
        <HStack spacing="$4">
          <Radio variant="outline">Radio</Radio>
          <Radio variant="filled">Radio</Radio>
        </HStack>
      </Preview>
      <SectionSubtitle id="label-placement">Radio label placement</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>labelPlacement</Code> prop to change the placement of the label. You can set
        the value to <Code>start</Code> or <Code>end</Code>.
      </Text>
      <Preview snippet={snippets.radioLabelPlacement} mb="$10">
        <HStack spacing="$4">
          <Radio labelPlacement="start">Radio</Radio>
          <Radio labelPlacement="end">Radio</Radio>
        </HStack>
      </Preview>
      <SectionSubtitle id="disabled">Disabled state</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>disabled</Code> prop to disable the Radio.
      </Text>
      <Preview snippet={snippets.radioDisabled} mb="$10">
        <HStack spacing="$4">
          <Radio disabled>Radio</Radio>
          <Radio variant="filled" disabled>
            Radio
          </Radio>
          <Radio defaultChecked disabled>
            Radio
          </Radio>
        </HStack>
      </Preview>
      <SectionSubtitle id="invalid">Invalid state</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>invalid</Code> prop to mark the Radio as invalid.
      </Text>
      <Preview snippet={snippets.radioInvalid} mb="$10">
        <HStack spacing="$4">
          <Radio invalid>Radio</Radio>
          <Radio variant="filled" invalid>
            Radio
          </Radio>
          <Radio defaultChecked invalid>
            Radio
          </Radio>
        </HStack>
      </Preview>
      <SectionSubtitle id="name-prop">
        Note about <Code>name</Code> prop
      </SectionSubtitle>
      <Text mb="$5">
        We recommend passing the <Code>name</Code> prop to the <Code>RadioGroup</Code> component,
        instead of passing it to each <Code>Radio</Code> component. By default, the{" "}
        <Code>name</Code> prop of the <Code>RadioGroup</Code> takes precedence.
      </Text>
      <CodeSnippet snippet={snippets.nameProp} mb="$12" />
      <SectionTitle id="theming">Theming</SectionTitle>
      <Text mb="$5">
        <Code>Radio</Code> base styles and default props can be overridden in the Hope UI theme
        configuration like below:
      </Text>
      <CodeSnippet lang="js" snippet={snippets.theming} mb="$12" />
      <SectionTitle id="props">Props</SectionTitle>
      <SectionSubtitle id="radio-props">Radio props</SectionSubtitle>
      <PropsTable items={radioPropItems} mb="$10" />
      <SectionSubtitle id="radio-group-props">RadioGroup props</SectionSubtitle>
      <PropsTable items={radioGroupPropItems} />
    </PageLayout>
  );
}
