import { Alert, AlertDescription, Anchor, Box, hope, HStack, Stack, Text } from "@hope-ui/solid";
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

export default function StackDoc() {
  const previousLink: ContextualNavLink = {
    href: "/docs/layout/simple-grid",
    label: "SimpleGrid",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/typography/heading",
    label: "Heading",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#import", label: "Import" },
    { href: "#usage", label: "Usage" },
    { href: "#responsive-direction", label: "Responsive direction", indent: true },
    { href: "#notes-on-stack-vs-flex", label: "Notes on Stack vs Flex", indent: true },
    { href: "#props", label: "Props" },
  ];

  const propItems: PropsTableItem[] = [
    {
      name: "direction",
      description: "The direction to stack the items. Shorthand for flexDirection style prop.",
      type: "Property.FlexDirection",
    },
    {
      name: "wrap",
      description: "Shorthand for flexWrap style prop.",
      type: "Property.FlexWrap",
    },
    {
      name: "spacing",
      description: "The space between each stack item.",
      type: "Property.Gap",
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
      <PageTitle>Stack</PageTitle>
      <Text mb="$5">
        Stack is a layout component that makes it easy to stack elements together and apply a space
        between them. It uses CSS <Code>gap</Code> properties to add spacing between its children
      </Text>
      <Alert status="warning" mb="$12">
        <AlertDescription>
          You can check if your browser support CSS gap property in Flex layout on{" "}
          <Anchor
            href="https://caniuse.com/?search=gap%20flex%20layout"
            external
            color="$primary11"
            fontWeight="$semibold"
          >
            caniuse.com
          </Anchor>
        </AlertDescription>
      </Alert>
      <SectionTitle id="import">Import</SectionTitle>
      <CodeSnippet snippet={snippets.importComponent} mb="$6" />
      <hope.ul ps="$6" mb="$12">
        <hope.li mb="$2">
          <strong>Stack:</strong> Used to add spacing between elements in the horizontal or vertical
          direction. It supports responsive values.
        </hope.li>
        <hope.li mb="$2">
          <strong>HStack:</strong> Used to add spacing between elements in horizontal direction, and
          centers them.
        </hope.li>
        <hope.li>
          <strong>VStack:</strong> Used to add spacing between elements in vertical direction only,
          and centers them.
        </hope.li>
      </hope.ul>
      <SectionTitle id="usage">Usage</SectionTitle>
      <Text mb="$5">
        To stack elements in horizontal or vertical direction only, use the <Code>HStack</Code> or{" "}
        <Code>VStack</Code> components. You can also use the <Code>Stack</Code> component as well
        and pass the <Code>direction</Code> prop.
      </Text>
      <Preview snippet={snippets.basicUsage} mb="$10">
        <HStack spacing="24px">
          <Box w="40px" h="40px" bg="$warning9">
            1
          </Box>
          <Box w="40px" h="40px" bg="tomato">
            2
          </Box>
          <Box w="40px" h="40px" bg="pink">
            3
          </Box>
        </HStack>
      </Preview>
      <SectionSubtitle id="responsive-direction">Responsive direction</SectionSubtitle>
      <Text mb="$5">
        You can pass responsive values to the <Code>Stack</Code> component to change stack direction
        and/or spacing between elements.
      </Text>
      <Preview snippet={snippets.responsiveDirection} mb="$10">
        <Stack direction={{ "@initial": "column", "@md": "row" }} spacing="24px">
          <Box w="40px" h="40px" bg="$warning9">
            1
          </Box>
          <Box w="40px" h="40px" bg="tomato">
            2
          </Box>
          <Box w="40px" h="40px" bg="pink">
            3
          </Box>
        </Stack>
      </Preview>
      <SectionSubtitle id="notes-on-stack-vs-flex">Notes on Stack vs Flex</SectionSubtitle>
      <Text mb="$12">
        Stack's primary use case is to lay items out and control the spacing between each item. If
        you have a more complicated use case, such as changing the margin on the last child, you can
        combine <Code>Stack</Code> and <Code>Flex</Code> and use{" "}
        <Code>justify-content: space-between</Code> for more control of the layout.
      </Text>
      <SectionTitle id="props">Props</SectionTitle>
      <PropsTable items={propItems} />
    </PageLayout>
  );
}
