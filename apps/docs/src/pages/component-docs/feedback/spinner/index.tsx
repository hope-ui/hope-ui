import { HStack, Spinner, Text } from "@hope-ui/solid";
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

export default function SpinnerDoc() {
  const previousLink: ContextualNavLink = {
    href: "/docs/feedback/skeleton",
    label: "Skeleton",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/feedback/notification",
    label: "Notification",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#import", label: "Import" },
    { href: "#usage", label: "Usage" },
    { href: "#color", label: "Spinner color", indent: true },
    { href: "#empty-area-color", label: "Spinner empty area color", indent: true },
    { href: "#sizes", label: "Spinner sizes", indent: true },
    { href: "#theming", label: "Theming" },
    { href: "#props", label: "Props" },
  ];

  const propItems: PropsTableItem[] = [
    {
      name: "size",
      description: "The size of the spinner.",
      type: '"xs" | "sm" | "md" | "lg" | "xl"',
      defaultValue: '"md"',
    },
    {
      name: "emptyColor",
      description: "The color of the empty area in the spinner.",
      type: "Property.Color | ColorScaleValue",
    },
    {
      name: "color",
      description: "The color of the spinner.",
      type: "Property.Color | ColorScaleValue",
    },
    {
      name: "thickness",
      description: "The thickness of the spinner.",
      type: "Property.BorderWidth<SizeScaleValue>",
    },
    {
      name: "speed",
      description: "The speed of the spinner.",
      type: "Property.TransitionDuration",
    },
    {
      name: "label",
      description:
        "For accessibility, the fallback loading text. This text will be visible to screen readers.",
      type: "string",
      defaultValue: "Loading...",
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
      <PageTitle>Spinner</PageTitle>
      <Text mb="$5">
        Spinners provide a visual cue that an action is either processing, awaiting a course of
        change or a result.
      </Text>
      <SectionTitle id="import">Import</SectionTitle>
      <CodeSnippet snippet={snippets.importComponent} mb="$12" />
      <SectionTitle id="usage">Usage</SectionTitle>
      <Preview snippet={snippets.basicUsage} mb="$10">
        <Spinner />
      </Preview>
      <SectionSubtitle id="color">Spinner color</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>color</Code> prop to change the color of the Spinner.
      </Text>
      <Preview snippet={snippets.color} mb="$10">
        <Spinner color="tomato" />
      </Preview>
      <SectionSubtitle id="empty-area-color">Spinner empty area color</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>emptyColor</Code> prop to change the background color of the Spinner.
      </Text>
      <Preview snippet={snippets.emptyAreaColor} mb="$10">
        <Spinner thickness="4px" speed="0.65s" emptyColor="$neutral4" color="$info10" size="xl" />
      </Preview>
      <SectionSubtitle id="sizes">Spinner sizes</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>size</Code> prop to change the size of the Button. You can set the value to{" "}
        <Code>xs</Code>, <Code>sm</Code>, <Code>md</Code>, <Code>lg</Code> or <Code>xl</Code>.
      </Text>
      <Preview snippet={snippets.sizes} mb="$12">
        <HStack spacing="$4">
          <Spinner size="xs" />
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
          <Spinner size="xl" />
        </HStack>
      </Preview>
      <SectionTitle id="theming">Theming</SectionTitle>
      <Text mb="$5">
        <Code>Spinner</Code> base styles and default props can be overridden in the Hope UI theme
        configuration like below:
      </Text>
      <CodeSnippet lang="js" snippet={snippets.theming} mb="$12" />
      <SectionTitle id="props">Props</SectionTitle>
      <PropsTable items={propItems} />
    </PageLayout>
  );
}
