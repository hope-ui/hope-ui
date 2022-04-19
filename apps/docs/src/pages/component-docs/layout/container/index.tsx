import { Alert, AlertDescription, Box, Container, Text } from "@hope-ui/solid";
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

export default function ContainerDoc() {
  const previousLink: ContextualNavLink = {
    href: "/docs/layout/center",
    label: "Center",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/layout/divider",
    label: "Divider",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#import", label: "Import" },
    { href: "#usage", label: "Usage" },
    { href: "#centering-the-container", label: "Centering the container", indent: true },
    { href: "#centering-the-children", label: "Centering the children", indent: true },
    { href: "#props", label: "Props" },
  ];

  const propItems: PropsTableItem[] = [
    {
      name: "centered",
      description: "If `true`, container itself will be centered on the page.",
      type: "ResponsiveValue<boolean>",
      defaultValue: "true",
    },
    {
      name: "centerContent",
      description: "If `true`, container will center its children regardless of their width.",
      type: "ResponsiveValue<boolean>",
      defaultValue: "false",
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
      <PageTitle>Container</PageTitle>
      <Text mb="$5">
        Containers are used to constrain a content's width to the current breakpoint, while keeping
        it fluid.
      </Text>
      <Text mb="$5">
        By default, it sets the <Code>max-width</Code> of the content to match the{" "}
        <Code>min-width</Code> of the current breakpoint. This is useful if you’d prefer to design
        for a fixed set of screen sizes instead of trying to accommodate a fully fluid viewport.
      </Text>
      <Text mb="$5">
        You can customize this behavior by passing custom <Code>maxWidth</Code> values.
      </Text>
      <SectionTitle id="import">Import</SectionTitle>
      <CodeSnippet snippet={snippets.importComponent} mb="$12" />
      <SectionTitle id="usage">Usage</SectionTitle>
      <Text mb="$5">
        To contain any piece of content, wrap it in the <Code>Container</Code> component.
      </Text>
      <Preview snippet={snippets.basicUsage} mb="$5">
        <Container>
          There are many benefits to a joint design and development system. Not only does it bring
          benefits to the design team, but it also brings benefits to engineering teams. It makes
          sure that our experiences have a consistent look and feel, not just in our design specs,
          but in production
        </Container>
      </Preview>
      <Alert status="info" mb="$12">
        <AlertDescription>
          The whole Hope UI docs is inside a <Code>Container</Code>, try resize your browser to see
          it in action.
        </AlertDescription>
      </Alert>
      <SectionSubtitle id="centering-the-container">Centering the container</SectionSubtitle>
      <Text mb="$5">
        By default the container is centered within its parent with a margin <Code>auto</Code> on
        left and right, you can disabled this behavior by setting the <Code>centered</Code> prop to{" "}
        <Code>false</Code>.
      </Text>
      <Preview snippet={snippets.centerContainer} mb="$12">
        <Container p="$4" bg="tomato" color="white" maxW="$xl" centered={false}>
          There are many benefits to a joint design and development system. Not only does it bring
          benefits to the design team.
        </Container>
      </Preview>
      <SectionSubtitle id="centering-the-children">Centering the children</SectionSubtitle>
      <Text mb="$5">
        In some cases, the width of the content can be smaller than the container's width, you can
        use the <Code>centerContent</Code> prop to center the content.
      </Text>
      <Preview snippet={snippets.centerContent} mb="$12">
        <Container bg="salmon" centerContent>
          <Box p="$4" bg="tomato" color="white" maxW="$xl">
            There are many benefits to a joint design and development system. Not only does it bring
            benefits to the design team.
          </Box>
        </Container>
      </Preview>
      <SectionTitle id="props">Props</SectionTitle>
      <PropsTable items={propItems} />
    </PageLayout>
  );
}
