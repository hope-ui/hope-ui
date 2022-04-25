import { CloseButton, HStack, Text } from "@hope-ui/solid";
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

export default function CloseButtonDoc() {
  const previousLink: ContextualNavLink = {
    href: "/docs/overlay/tooltip",
    label: "Toolitp",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#import", label: "Import" },
    { href: "#usage", label: "Usage" },
    { href: "#sizes", label: "Button sizes", indent: true },
    { href: "#theming", label: "Theming" },
    { href: "#props", label: "Props" },
  ];

  const propItems: PropsTableItem[] = [
    {
      name: "size",
      description: "The size of the button.",
      type: '"sm" | "md" | "lg"',
      defaultValue: '"md"',
    },
    {
      name: "aria-label",
      description: "A label that describes the button.",
      type: "string",
    },
    {
      name: "icon",
      description: "The icon to be used in the button.",
      type: "JSX.Element",
    },
  ];

  onMount(() => {
    Prism.highlightAll();
  });

  return (
    <PageLayout previousLink={previousLink} contextualNavLinks={contextualNavLinks}>
      <PageTitle>CloseButton</PageTitle>
      <Text mb="$5">
        <Code>CloseButton</Code> is essentially a button with a close icon. It is used to handle the
        close functionality in feedback and overlay components like Alerts, Notifications, Drawers
        and Modals.
      </Text>
      <SectionTitle id="import">Import</SectionTitle>
      <CodeSnippet snippet={snippets.importComponent} mb="$12" />
      <SectionTitle id="usage">Usage</SectionTitle>
      <Preview snippet={snippets.basicUsage} mb="$12">
        <CloseButton />
      </Preview>
      <SectionSubtitle id="sizes">Button sizes</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>size</Code> prop to change the size of the CloseButton. You can set the value
        to <Code>sm</Code>, <Code>md</Code> or <Code>lg</Code>.
      </Text>
      <Preview snippet={snippets.closeButtonSizes} mb="$12">
        <HStack spacing="$4">
          <CloseButton size="sm" />
          <CloseButton size="md" />
          <CloseButton size="lg" />
        </HStack>
      </Preview>
      <SectionTitle id="theming">Theming</SectionTitle>
      <Text mb="$5">
        <Code>CloseButton</Code> base styles and default props can be overridden in the Hope UI
        theme configuration like below:
      </Text>
      <CodeSnippet lang="js" snippet={snippets.theming} mb="$12" />
      <SectionTitle id="props">Props</SectionTitle>
      <PropsTable items={propItems} />
    </PageLayout>
  );
}
