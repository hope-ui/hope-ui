import { Alert, AlertDescription, Box, SimpleGrid, Text } from "@hope-ui/solid";
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

export default function SimpleGridDoc() {
  const previousLink: ContextualNavLink = {
    href: "/docs/layout/grid",
    label: "Grid",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/layout/stack",
    label: "Stack",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#import", label: "Import" },
    { href: "#usage", label: "Usage" },
    { href: "#auto-responsive-grid", label: "Auto-responsive grid", indent: true },
    { href: "#spacing", label: "Changing the spacing for columns and rows", indent: true },
    { href: "#props", label: "Props" },
  ];

  const propItems: PropsTableItem[] = [
    {
      name: "minChildWidth",
      description:
        "The width at which child elements will break into columns. Pass a number for pixel values or a string for any other valid CSS length.",
      type: "ResponsiveValue<Property.MinWidth>",
    },
    {
      name: "columns",
      description: "The number of columns.",
      type: "ResponsiveValue<number>",
    },
  ];

  onMount(() => {
    Prism.highlightAll();
  });

  return (
    <PageLayout previousLink={previousLink} nextLink={nextLink} contextualNavLinks={contextualNavLinks}>
      <PageTitle>SimpleGrid</PageTitle>
      <Text mb="$8">
        SimpleGrid provides a friendly interface to create responsive grid layouts with ease. It renders a{" "}
        <Code>div</Code> element with <Code>display: grid</Code>.
      </Text>
      <SectionTitle id="import">Import</SectionTitle>
      <CodeSnippet snippet={snippets.importComponent} mb="$12" />
      <SectionTitle id="usage">Usage</SectionTitle>
      <Text mb="$5">Specifying the number of columns for the grid layout.</Text>
      <Preview snippet={snippets.basicUsage} mb="$8">
        <SimpleGrid columns={2} gap="$10">
          <Box bg="tomato" height="80px"></Box>
          <Box bg="tomato" height="80px"></Box>
          <Box bg="tomato" height="80px"></Box>
          <Box bg="tomato" height="80px"></Box>
          <Box bg="tomato" height="80px"></Box>
        </SimpleGrid>
      </Preview>
      <Text mb="$5">
        You can also make it responsive by passing an object value into the <Code>columns</Code> prop.
      </Text>
      <Preview snippet={snippets.responsiveColumns} mb="$10">
        <SimpleGrid columns={{ "@initial": 2, "@md": 3 }} gap="40px">
          <Box bg="tomato" height="80px"></Box>
          <Box bg="tomato" height="80px"></Box>
          <Box bg="tomato" height="80px"></Box>
          <Box bg="tomato" height="80px"></Box>
          <Box bg="tomato" height="80px"></Box>
        </SimpleGrid>
      </Preview>
      <SectionSubtitle id="auto-responsive-grid">Auto-responsive grid</SectionSubtitle>
      <Text mb="$5">
        To make the grid responsive and adjust automatically without passing <Code>columns</Code>, simply pass the{" "}
        <Code>minChildWidth</Code> prop to specify the <Code>min-width</Code> a child should have before adjusting the
        layout.
      </Text>
      <Text mb="$5">
        This uses css grid <Code>auto-fit</Code> and <Code>minmax()</Code> internally.
      </Text>
      <Preview snippet={snippets.autoResponsive} mb="$10">
        <SimpleGrid minChildWidth="120px" gap="40px">
          <Box bg="tomato" height="80px"></Box>
          <Box bg="tomato" height="80px"></Box>
          <Box bg="tomato" height="80px"></Box>
          <Box bg="tomato" height="80px"></Box>
          <Box bg="tomato" height="80px"></Box>
          <Box bg="tomato" height="80px"></Box>
        </SimpleGrid>
      </Preview>
      <SectionSubtitle id="spacing">Changing the spacing for columns and rows</SectionSubtitle>
      <Text mb="$5">
        Simply pass the <Code>gap</Code> prop to change the row and column spacing between the grid items.{" "}
        <Code>SimpleGrid</Code> also allows you pass <Code>columnGap</Code> and <Code>rowGap</Code> to define the space
        between columns and rows respectively.
      </Text>
      <Preview snippet={snippets.spacing} mb="$6">
        <SimpleGrid columns={2} columnGap="40px" rowGap="20px">
          <Box bg="tomato" height="80px"></Box>
          <Box bg="tomato" height="80px"></Box>
          <Box bg="tomato" height="80px"></Box>
          <Box bg="tomato" height="80px"></Box>
          <Box bg="tomato" height="80px"></Box>
        </SimpleGrid>
      </Preview>
      <Alert status="warning" mb="$12">
        <AlertDescription>
          CSS gap properties can be confusing, <Code>columnGap</Code> add space on the X axis whereas{" "}
          <Code>rowGap</Code> add space on the Y axis.
        </AlertDescription>
      </Alert>
      <SectionTitle id="props">Props</SectionTitle>
      <Text mb="$5">
        SimpleGrid composes <Code>Grid</Code> so you can pass all the <Code>Grid</Code> props and css grid props with
        addition of these:
      </Text>
      <PropsTable items={propItems} />
    </PageLayout>
  );
}
