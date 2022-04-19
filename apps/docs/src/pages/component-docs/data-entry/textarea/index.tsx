import { Text, Textarea, VStack } from "@hope-ui/solid";
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

import { snippets } from "./snippets";

export default function TextareaDoc() {
  const [value, setValue] = createSignal("");
  const handleInput = (event: Event) => setValue((event.target as HTMLTextAreaElement).value);

  const previousLink: ContextualNavLink = {
    href: "/docs/data-entry/switch",
    label: "Switch",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/data-display/accordion",
    label: "Accordion",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#import", label: "Import" },
    { href: "#usage", label: "Usage" },
    { href: "#sizes", label: "Textarea sizes", indent: true },
    { href: "#variants", label: "Textarea variants", indent: true },
    { href: "#disabled", label: "Disabled state", indent: true },
    { href: "#invalid", label: "Invalid state", indent: true },
    { href: "#controlled", label: "Controlled textarea", indent: true },
    { href: "#theming", label: "Theming" },
    { href: "#props", label: "Props" },
  ];

  const propItems: PropsTableItem[] = [
    {
      name: "variant",
      description: "The visual style of the textarea.",
      type: '"outline" | "filled" | "unstyled"',
      defaultValue: '"outline"',
    },
    {
      name: "size",
      description: "The size of the textarea's text.",
      type: '"xs" | "sm" | "md" | "lg"',
      defaultValue: '"md"',
    },
    {
      name: "required",
      description:
        "If `true`, the textarea is marked as required, and `required` attribute will be added",
      type: "boolean",
    },
    {
      name: "disabled",
      description: "If `true`, the textarea will be disabled.",
      type: "boolean",
    },
    {
      name: "invalid",
      description: "If `true`, the textarea will have `aria-invalid` set to `true`.",
      type: "boolean",
    },
    {
      name: "readOnly",
      description: "If `true`, the textarea will be readonly.",
      type: "boolean",
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
      <PageTitle>Textarea</PageTitle>
      <Text mb="$5">
        The <Code>Textarea</Code> component allows you to easily create multi-line text textareas.
      </Text>
      <SectionTitle id="import">Import</SectionTitle>
      <CodeSnippet snippet={snippets.importComponent} mb="$12" />
      <SectionTitle id="usage">Usage</SectionTitle>
      <Preview snippet={snippets.basicUsage} mb="$12">
        <Textarea placeholder="Basic usage" />
      </Preview>
      <SectionSubtitle id="sizes">Textarea sizes</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>size</Code> prop to change the size of the Textarea's text. You can set the
        value to <Code>xs</Code>, <Code>sm</Code>, <Code>md</Code> or <Code>lg</Code>.
      </Text>
      <Preview snippet={snippets.textareaSizes} mb="$10">
        <VStack spacing="$4">
          <Textarea placeholder="extra small size" size="xs" />
          <Textarea placeholder="small size" size="sm" />
          <Textarea placeholder="medium size" size="md" />
          <Textarea placeholder="large size" size="lg" />
        </VStack>
      </Preview>
      <SectionSubtitle id="variants">Textarea variants</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>variant</Code> prop to change the visual style of the Textarea. You can set
        the value to <Code>outline</Code>, <Code>filled</Code> or <Code>unstyled</Code>.
      </Text>
      <Preview snippet={snippets.textareaVariants} mb="$10">
        <VStack spacing="$4">
          <Textarea placeholder="Outline" variant="outline" />
          <Textarea placeholder="Filled" variant="filled" />
          <Textarea placeholder="Unstyled" variant="unstyled" />
        </VStack>
      </Preview>
      <SectionSubtitle id="disabled">Disabled state</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>disabled</Code> prop to disable the Textarea.
      </Text>
      <Preview snippet={snippets.textareaDisabled} mb="$10">
        <Textarea disabled placeholder="Here is a sample placeholder" />
      </Preview>
      <SectionSubtitle id="invalid">Invalid state</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>invalid</Code> prop to mark the Textarea as invalid.
      </Text>
      <Preview snippet={snippets.textareaInvalid} mb="$10">
        <Textarea invalid placeholder="Here is a sample placeholder" />
      </Preview>
      <SectionSubtitle id="controlled">Controlled textarea</SectionSubtitle>
      <Preview snippet={snippets.controlledTextarea} mb="$12">
        <Text mb="$2">Value: {value()}</Text>
        <Textarea
          value={value()}
          onInput={handleInput}
          placeholder="Here is a sample placeholder"
          size="sm"
        />
      </Preview>
      <SectionTitle id="theming">Theming</SectionTitle>
      <Text mb="$5">
        <Code>Textarea</Code> base styles and default props can be overridden in the Hope UI theme
        configuration like below:
      </Text>
      <CodeSnippet lang="js" snippet={snippets.theming} mb="$12" />
      <SectionTitle id="props">Props</SectionTitle>
      <PropsTable items={propItems} />
    </PageLayout>
  );
}
