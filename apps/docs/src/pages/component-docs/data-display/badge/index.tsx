import { Badge, HStack, Text } from "@hope-ui/design-system";
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

export default function BadgeDoc() {
  const previousLink: ContextualNavLink = {
    href: "/docs/data-display/avatar",
    label: "Avatar",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/data-display/icon",
    label: "Icon",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#import", label: "Import" },
    { href: "#usage", label: "Usage" },
    { href: "#colors", label: "Badge colors", indent: true },
    { href: "#variants", label: "Badge variants", indent: true },
    { href: "#theming", label: "Theming" },
    { href: "#props", label: "Props" },
  ];

  const propItems: PropsTableItem[] = [
    {
      name: "variant",
      description: "The visual style of the badge.",
      type: '"solid" | "subtle" | "outline"',
      defaultValue: '"subtle"',
    },
    {
      name: "colorScheme",
      description: "The color of the badge.",
      type: '"primary" | "accent" | "neutral" | "success" | "info" | "warning" | "danger"',
      defaultValue: '"neutral"',
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
      <PageTitle>Badge</PageTitle>
      <Text mb="$5">Badges are used to highlight an item's status for quick recognition.</Text>
      <SectionTitle id="import">Import</SectionTitle>
      <CodeSnippet snippet={snippets.importComponent} mb="$12" />
      <SectionTitle id="usage">Usage</SectionTitle>
      <Preview snippet={snippets.basicUsage} mb="$12">
        <Badge>Badge</Badge>
      </Preview>
      <SectionSubtitle id="colors">Badge colors</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>colorScheme</Code> prop to change the color of the Badge. You can set the
        value to <Code>primary</Code>, <Code>accent</Code>, <Code>neutral</Code>,{" "}
        <Code>success</Code>, <Code>info</Code>, <Code>warning</Code> or <Code>danger</Code>.
      </Text>
      <Preview snippet={snippets.colors} mb="$10">
        <HStack spacing="$4">
          <Badge colorScheme="primary">Badge</Badge>
          <Badge colorScheme="accent">Badge</Badge>
          <Badge colorScheme="neutral">Badge</Badge>
          <Badge colorScheme="success">Badge</Badge>
          <Badge colorScheme="info">Badge</Badge>
          <Badge colorScheme="warning">Badge</Badge>
          <Badge colorScheme="danger">Badge</Badge>
        </HStack>
      </Preview>
      <SectionSubtitle id="variants">Badge variants</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>variant</Code> prop to change the visual style of the Badge. You can set the
        value to <Code>solid</Code>, <Code>subtle</Code> or <Code>outline</Code>.
      </Text>
      <Preview snippet={snippets.variants} mb="$10">
        <HStack spacing="$4">
          <Badge variant="solid">Badge</Badge>
          <Badge variant="subtle">Badge</Badge>
          <Badge variant="outline">Badge</Badge>
        </HStack>
      </Preview>
      <SectionTitle id="theming">Theming</SectionTitle>
      <Text mb="$5">
        <Code>Badge</Code> base styles and default props can be overridden in the Hope UI theme
        configuration like below:
      </Text>
      <CodeSnippet lang="js" snippet={snippets.theming} mb="$12" />
      <SectionTitle id="props">Props</SectionTitle>
      <PropsTable items={propItems} />
    </PageLayout>
  );
}
