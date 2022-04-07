import { Anchor, Text } from "@hope-ui/solid";
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
import { IconExternalLink } from "@/icons/IconExternalLink";

import { snippets } from "./snippets";

export default function AnchorDoc() {
  const previousLink: ContextualNavLink = {
    href: "/docs/data-display/tag",
    label: "Tag",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/navigation/breadcrumb",
    label: "Breadcrumb",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#import", label: "Import" },
    { href: "#usage", label: "Usage" },
    { href: "#external-link", label: "External link", indent: true },
    { href: "#anchor-inline-with-text", label: "Anchor inline with text", indent: true },
    { href: "#usage-with-routing-library", label: "Usage with routing library" },
    { href: "#theming", label: "Theming" },
    { href: "#props", label: "Props" },
  ];

  const propItems: PropsTableItem[] = [
    {
      name: "external",
      description: "If `true`, the link will open in a new tab.",
      type: "boolean",
    },
  ];

  onMount(() => {
    Prism.highlightAll();
  });

  return (
    <PageLayout previousLink={previousLink} nextLink={nextLink} contextualNavLinks={contextualNavLinks}>
      <PageTitle>Anchor</PageTitle>
      <Text mb="$5">
        Anchors are accessible elements used primarily for navigation. This component is styled to resemble a hyperlink
        and semantically renders an <Code>a</Code>.
      </Text>
      <SectionTitle id="import">Import</SectionTitle>
      <CodeSnippet snippet={snippets.importComponent} mb="$12" />
      <SectionTitle id="usage">Usage</SectionTitle>
      <Preview snippet={snippets.basicUsage} mb="$10">
        <Anchor>Hope UI</Anchor>
      </Preview>
      <SectionSubtitle id="external-link">External link</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>external</Code> prop to open the link in a new tab.
      </Text>
      <Preview snippet={snippets.externalLink} mb="$10">
        <Anchor href="https://hope-ui.com" external>
          Hope UI <IconExternalLink ml="2px" verticalAlign="text-bottom" />
        </Anchor>
      </Preview>
      <SectionSubtitle id="anchor-inline-with-text">Anchor inline with text</SectionSubtitle>
      <Preview snippet={snippets.anchorWithInlineText} mb="$12">
        <Text>
          Did you know that{" "}
          <Anchor color="$primary10" href="#">
            Anchors can live inline with text
          </Anchor>
        </Text>
      </Preview>
      <SectionTitle id="usage-with-routing-library">Usage with routing library</SectionTitle>
      <Text mb="$5">
        To use the <Code>Anchor</Code> with a routing library like <Code>solid-app-router</Code>, all you need to do is
        pass the <Code>as</Code> prop. It'll replace the rendered <Code>a</Code> tag with the router's <Code>Link</Code>
        .
      </Text>
      <CodeSnippet snippet={snippets.usageWithRoutingLibrary} mb="$12" />
      <SectionTitle id="theming">Theming</SectionTitle>
      <Text mb="$5">
        <Code>Anchor</Code> base styles and default props can be overridden in the Hope UI theme configuration like
        below:
      </Text>
      <CodeSnippet lang="js" snippet={snippets.theming} mb="$12" />
      <SectionTitle id="props">Props</SectionTitle>
      <PropsTable items={propItems} />
    </PageLayout>
  );
}
