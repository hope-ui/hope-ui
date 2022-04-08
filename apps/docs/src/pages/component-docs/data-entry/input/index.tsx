import {
  Input,
  InputGroup,
  InputLeftAddon,
  InputLeftElement,
  InputRightAddon,
  InputRightElement,
  Text,
  VStack,
} from "@hope-ui/solid";
import Prism from "prismjs";
import { createSignal, onMount } from "solid-js";

import Code from "@/components/Code";
import CodeSnippet from "@/components/CodeSnippet";
import { ContextualNavLink } from "@/components/ContextualNav";
import PageLayout from "@/components/PageLayout";
import PageTitle from "@/components/PageTitle";
import { Preview } from "@/components/Preview";
import { PropsTable, PropsTableItem } from "@/components/PropsTable";
import SectionSubtitle from "@/components/SectionSubtitle";
import SectionTitle from "@/components/SectionTitle";
import { IconCheck } from "@/icons/IconCheck";
import { IconPhone } from "@/icons/IconPhone";

import { snippets } from "./snippets";

export default function InputDoc() {
  const [value, setValue] = createSignal("");
  const handleInput = (event: Event) => setValue((event.target as HTMLInputElement).value);

  const previousLink: ContextualNavLink = {
    href: "/docs/data-entry/form-control",
    label: "FormControl",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/data-entry/radio",
    label: "Radio",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#import", label: "Import" },
    { href: "#usage", label: "Usage" },
    { href: "#sizes", label: "Input sizes", indent: true },
    { href: "#variants", label: "Input variants", indent: true },
    { href: "#addons", label: "Input addons", indent: true },
    { href: "#elements", label: "Input elements", indent: true },
    { href: "#disabled", label: "Disabled state", indent: true },
    { href: "#invalid", label: "Invalid state", indent: true },
    { href: "#controlled", label: "Controlled input", indent: true },
    { href: "#theming", label: "Theming" },
    { href: "#props", label: "Props" },
    { href: "#input-props", label: "Input props", indent: true },
    { href: "#input-group-props", label: "InputGroup props", indent: true },
  ];

  const inputPropItems: PropsTableItem[] = [
    {
      name: "variant",
      description: "The visual style of the input.",
      type: '"outline" | "filled" | "unstyled"',
      defaultValue: '"outline"',
    },
    {
      name: "size",
      description: "The size of the input.",
      type: '"xs" | "sm" | "md" | "lg"',
      defaultValue: '"md"',
    },
    {
      name: "required",
      description: "If `true`, the input is marked as required, and `required` attribute will be added",
      type: "boolean",
    },
    {
      name: "disabled",
      description: "If `true`, the input will be disabled.",
      type: "boolean",
    },
    {
      name: "invalid",
      description: "If `true`, the input will have `aria-invalid` set to `true`.",
      type: "boolean",
    },
    {
      name: "readOnly",
      description: "If `true`, the input will be readonly.",
      type: "boolean",
    },
    {
      name: "htmlSize",
      description: "The native HTML `size` attribute to be passed to the `input`.",
      type: "string | number",
    },
  ];

  const inputGroupPropItems: PropsTableItem[] = [
    {
      name: "variant",
      description: "The visual style of the input.",
      type: '"outline" | "filled" | "unstyled"',
      defaultValue: '"outline"',
    },
    {
      name: "size",
      description: "The size of the input.",
      type: '"xs" | "sm" | "md" | "lg"',
      defaultValue: '"md"',
    },
  ];

  onMount(() => {
    Prism.highlightAll();
  });

  return (
    <PageLayout previousLink={previousLink} nextLink={nextLink} contextualNavLinks={contextualNavLinks}>
      <PageTitle>Input</PageTitle>
      <Text mb="$5">
        The <Code>Input</Code> component is a component that is used to get user input in a text field.
      </Text>
      <SectionTitle id="import">Import</SectionTitle>
      <CodeSnippet snippet={snippets.importComponent} mb="$12" />
      <SectionTitle id="usage">Usage</SectionTitle>
      <Preview snippet={snippets.basicUsage} mb="$12">
        <Input placeholder="Basic usage" />
      </Preview>
      <SectionSubtitle id="sizes">Input sizes</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>size</Code> prop to change the size of the Input. You can set the value to <Code>xs</Code>,{" "}
        <Code>sm</Code>, <Code>md</Code> or <Code>lg</Code>.
      </Text>
      <Preview snippet={snippets.inputSizes} mb="$8">
        <VStack spacing="$4">
          <Input placeholder="extra small size" size="xs" />
          <Input placeholder="small size" size="sm" />
          <Input placeholder="medium size" size="md" />
          <Input placeholder="large size" size="lg" />
        </VStack>
      </Preview>
      <Text mb="$5">
        If you want to use the native DOM <Code>size</Code> attribute you can use the <Code>htmlSize</Code> prop. For it
        to work as expected you will also need to provide the <Code>width</Code> prop set to <Code>auto</Code>.
      </Text>
      <Preview snippet={snippets.inputDomSize} mb="$10">
        <Input htmlSize={4} width="auto" />
      </Preview>
      <SectionSubtitle id="variants">Input variants</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>variant</Code> prop to change the visual style of the Input. You can set the value to{" "}
        <Code>outline</Code>, <Code>filled</Code> or <Code>unstyled</Code>.
      </Text>
      <Preview snippet={snippets.inputVariants} mb="$10">
        <VStack spacing="$4">
          <Input placeholder="Outline" variant="outline" />
          <Input placeholder="Filled" variant="filled" />
          <Input placeholder="Unstyled" variant="unstyled" />
        </VStack>
      </Preview>
      <SectionSubtitle id="addons">Input addons</SectionSubtitle>
      <Text mb="$5">
        You can add addons to the left and right of the <Code>Input</Code> component. Hope UI exports{" "}
        <Code>InputGroup</Code>, <Code>InputLeftAddon</Code> and <Code>InputRightAddon</Code> to help with this use
        case.
      </Text>
      <Preview snippet={snippets.inputAddons} mb="$10">
        <VStack spacing="$4">
          <InputGroup>
            <InputLeftAddon>+234</InputLeftAddon>
            <Input type="tel" placeholder="phone number" />
          </InputGroup>
          <InputGroup size="sm">
            <InputLeftAddon>https://</InputLeftAddon>
            <Input placeholder="mysite" />
            <InputRightAddon>.com</InputRightAddon>
          </InputGroup>
        </VStack>
      </Preview>
      <SectionSubtitle id="elements">Input elements</SectionSubtitle>
      <Text mb="$5">
        In some scenarios, you might need to add an icon or button inside the input component. Hope UI exports{" "}
        <Code>InputLeftElement</Code> and <Code>InputRightElement</Code> to help with this use case.
      </Text>
      <Text mb="$5">
        If the left or right is an icon or text, you can pass <Code>pointerEvents="none"</Code> to{" "}
        <Code>InputLeftElement</Code> or <Code>InputRightElement</Code> to ensure that clicking on them focused the
        input.
      </Text>
      <Preview snippet={snippets.inputElements} mb="$10">
        <VStack spacing="$4">
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <IconPhone color="$neutral8" />
            </InputLeftElement>
            <Input type="tel" placeholder="Phone number" />
          </InputGroup>
          <InputGroup>
            <InputLeftElement pointerEvents="none" color="$neutral8" fontSize="1.2em">
              $
            </InputLeftElement>
            <Input placeholder="Enter amount" />
            <InputRightElement pointerEvents="none">
              <IconCheck boxSize="20px" color="$success9" />
            </InputRightElement>
          </InputGroup>
        </VStack>
      </Preview>
      <SectionSubtitle id="disabled">Disabled state</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>disabled</Code> prop to disable the Input.
      </Text>
      <Preview snippet={snippets.inputDisabled} mb="$10">
        <Input disabled placeholder="Here is a sample placeholder" />
      </Preview>
      <SectionSubtitle id="invalid">Invalid state</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>invalid</Code> prop to mark the Input as invalid.
      </Text>
      <Preview snippet={snippets.inputInvalid} mb="$10">
        <Input invalid placeholder="Here is a sample placeholder" />
      </Preview>
      <SectionSubtitle id="controlled">Controlled input</SectionSubtitle>
      <Preview snippet={snippets.controlledInput} mb="$12">
        <Text mb="$2">Value: {value()}</Text>
        <Input value={value()} onInput={handleInput} placeholder="Here is a sample placeholder" size="sm" />
      </Preview>
      <SectionTitle id="theming">Theming</SectionTitle>
      <Text mb="$5">
        <Code>Input</Code> base styles and default props can be overridden in the Hope UI theme configuration like
        below:
      </Text>
      <CodeSnippet lang="js" snippet={snippets.theming} mb="$12" />
      <SectionTitle id="props">Props</SectionTitle>
      <SectionSubtitle id="input-props">Input props</SectionSubtitle>
      <PropsTable items={inputPropItems} mb="$10" />
      <SectionSubtitle id="input-group-props">InputGroup props</SectionSubtitle>
      <PropsTable items={inputGroupPropItems} />
    </PageLayout>
  );
}
