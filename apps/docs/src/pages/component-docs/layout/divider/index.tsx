import { Center, Divider, Text, VStack } from "@hope-ui/design-system";
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

export default function DividerDoc() {
  const previousLink: ContextualNavLink = {
    href: "/docs/layout/container",
    label: "Container",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/layout/flex",
    label: "Flex",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#import", label: "Import" },
    { href: "#usage", label: "Usage" },
    { href: "#orientation", label: "Orientation", indent: true },
    { href: "#variants", label: "Variants", indent: true },
    { href: "#thickness", label: "Thickness", indent: true },
    { href: "#props", label: "Props" },
  ];

  const propItems: PropsTableItem[] = [
    {
      name: "orientation",
      description: "The orientation of the Divider.",
      type: '"horizontal" | "vertical"',
      defaultValue: '"horizontal"',
    },
    {
      name: "variant",
      description: "The visual style of the Divider.",
      type: '"solid" | "dashed" | "dotted"',
      defaultValue: '"solid"',
    },
    {
      name: "thickness",
      description: "The thickness of the Divider.",
      type: "Property.BorderWidth<SizeScaleValue>",
      defaultValue: '"1px"',
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
      <PageTitle>Divider</PageTitle>
      <Text mb="$5">Dividers are used to visually separate content in a list or group.</Text>

      <SectionTitle id="import">Import</SectionTitle>
      <CodeSnippet snippet={snippets.importComponent} mb="$12" />
      <SectionTitle id="usage">Usage</SectionTitle>
      <Text mb="$5">
        The <Code>Divider</Code> displays a thin horizontal or vertical line, and renders a{" "}
        <Code>div</Code> tag.
      </Text>
      <Preview snippet={snippets.basicUsage} mb="$10">
        <Divider />
      </Preview>
      <SectionSubtitle id="orientation">Orientation</SectionSubtitle>
      <Text mb="$5">
        Pass the <Code>orientation</Code> prop and set it to either <Code>horizontal</Code> or{" "}
        <Code>vertical</Code>.
      </Text>
      <Preview snippet={snippets.horizontal} mb="$8">
        <Divider orientation="horizontal" />
      </Preview>
      <Text mb="$5">
        If the vertical orientation is used, make sure that the parent element is assigned a height.
      </Text>
      <Preview snippet={snippets.vertical} mb="$10">
        <Center height="50px">
          <Divider orientation="vertical" />
        </Center>
      </Preview>
      <SectionSubtitle id="variants">Variants</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>variant</Code> prop to change the visual style of the divider.
      </Text>
      <Preview snippet={snippets.variants} mb="$10">
        <VStack spacing="$4">
          <Divider variant="solid" />
          <Divider variant="dashed" />
          <Divider variant="dotted" />
        </VStack>
      </Preview>
      <SectionSubtitle id="thickness">Thickness</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>thickness</Code> prop to change the thickness of the divider.
      </Text>
      <Preview snippet={snippets.thickness} mb="$12">
        <Divider thickness="3px" />
      </Preview>
      <SectionTitle id="props">Props</SectionTitle>
      <PropsTable items={propItems} />
    </PageLayout>
  );
}
