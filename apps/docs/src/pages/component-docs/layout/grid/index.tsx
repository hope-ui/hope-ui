import { Anchor, Grid, GridItem, hope, Text } from "@hope-ui/design-system";
import Prism from "prismjs";
import { Link } from "solid-app-router";
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

export default function GridDoc() {
  const previousLink: ContextualNavLink = {
    href: "/docs/layout/flex",
    label: "Flex",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/layout/simple-grid",
    label: "SimpleGrid",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#import", label: "Import" },
    { href: "#template-columns", label: "Template columns" },
    { href: "#spanning-columns", label: "Spanning columns" },
    { href: "#starting-and-ending-lines", label: "Starting and ending lines" },
    { href: "#props", label: "Props" },
    { href: "#grid-props", label: "Grid props", indent: true },
    { href: "#grid-item-props", label: "GridItem props", indent: true },
  ];

  const gridPropItems: PropsTableItem[] = [
    {
      name: "autoColumns",
      description: "Short hand prop for gridAutoColumns.",
      type: "Property.GridAutoColumns",
    },
    {
      name: "autoRows",
      description: "Short hand prop for gridAutoRows.",
      type: "Property.GridAutoRows",
    },
    {
      name: "autoFlow",
      description: "Short hand prop for gridAutoFlow.",
      type: "Property.GridAutoFlow",
    },
    {
      name: "templateAreas",
      description: "Short hand prop for gridTemplateAreas.",
      type: "Property.GridTemplateAreas",
    },
    {
      name: "templateColumns",
      description: "Short hand prop for gridTemplateColumns.",
      type: "Property.GridTemplateColumns",
    },
    {
      name: "templateRows",
      description: "Short hand prop for gridTemplateRows.",
      type: "Property.GridTemplateRows",
    },
  ];

  const gridItemPropItems: PropsTableItem[] = [
    {
      name: "area",
      description: "Short hand prop for gridArea.",
      type: "Property.GridArea",
    },
    {
      name: "colStart",
      description: "The column number the grid item should start.",
      type: "Property.GridColumnStart",
    },
    {
      name: "colEnd",
      description: "The column number the grid item should end.",
      type: "Property.GridColumnEnd",
    },
    {
      name: "colSpan",
      description: "The number of columns the grid item should span.",
      type: 'string | number | "auto" | "full"',
    },
    {
      name: "rowStart",
      description: "The row number the grid item should start.",
      type: "Property.GridRowStart",
    },
    {
      name: "rowEnd",
      description: "The row number the grid item should end.",
      type: "Property.GridRowEnd",
    },
    {
      name: "rowSpan",
      description: "The number of rows the grid item should span.",
      type: 'string | number | "auto" | "full"',
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
      <PageTitle>Grid</PageTitle>
      <Text mb="$5">
        A primitive useful for grid layouts. Grid is{" "}
        <Anchor as={Link} href="/docs/layout/box" color="$primary11" fontWeight="$semibold">
          Box
        </Anchor>{" "}
        with <Code>display: grid</Code> and it comes with helpful style shorthand. It renders a{" "}
        <Code>div</Code> element.
      </Text>
      <SectionTitle id="import">Import</SectionTitle>
      <CodeSnippet snippet={snippets.importComponent} mb="$6" />
      <hope.ul ps="$6" mb="$12">
        <hope.li mb="$2">
          <strong>Grid:</strong> The main wrapper with <Code>display: grid</Code>.
        </hope.li>
        <hope.li>
          <strong>GridItem:</strong> Used as a child of <Code>Grid</Code> to control the span, and
          start positions within the grid.
        </hope.li>
      </hope.ul>
      <SectionTitle id="template-columns">Template columns</SectionTitle>
      <Text mb="$5">
        Here's an example of using grid template columns with the <Code>Grid</Code> component, and
        applying a <Code>gap</Code> (space) between the grid items.
      </Text>
      <Preview snippet={snippets.templateColumns} mb="$12">
        <Grid templateColumns="repeat(5, 1fr)" gap="$6">
          <GridItem w="100%" h="$10" bg="$info9" />
          <GridItem w="100%" h="$10" bg="$info9" />
          <GridItem w="100%" h="$10" bg="$info9" />
          <GridItem w="100%" h="$10" bg="$info9" />
          <GridItem w="100%" h="$10" bg="$info9" />
        </Grid>
      </Preview>
      <SectionTitle id="spanning-columns">Spanning columns</SectionTitle>
      <Text mb="$5">
        In some layouts, you may need certain grid items to span specific amount of columns or rows
        instead of an even distribution.
      </Text>
      <Text mb="$5">
        To achieve this, you need to pass the <Code>colSpan</Code> prop to the <Code>GridItem</Code>{" "}
        component to span across columns and also pass the <Code>rowSpan</Code> component to span
        across rows. You also need to specify the <Code>templateColumns</Code> and
        <Code>templateRows</Code>.
      </Text>
      <Preview snippet={snippets.spanningColumns} mb="$12">
        <Grid h="200px" templateRows="repeat(2, 1fr)" templateColumns="repeat(5, 1fr)" gap="$4">
          <GridItem rowSpan={2} colSpan={1} bg="tomato" />
          <GridItem colSpan={2} bg="papayawhip" />
          <GridItem colSpan={2} bg="papayawhip" />
          <GridItem colSpan={4} bg="tomato" />
        </Grid>
      </Preview>
      <SectionTitle id="starting-and-ending-lines">Starting and ending lines</SectionTitle>
      <Text mb="$5">
        Pass the <Code>colStart</Code> and <Code>colEnd</Code> prop to <Code>GridItem</Code>{" "}
        component to make an element start or end at the <Code>nth</Code> grid position.
      </Text>
      <Preview snippet={snippets.startingAndEndingLines} mb="$12">
        <Grid templateColumns="repeat(5, 1fr)" gap="$4">
          <GridItem colSpan={2} h="$10" bg="tomato" />
          <GridItem colStart={4} colEnd={6} h="$10" bg="papayawhip" />
        </Grid>
      </Preview>
      <SectionTitle id="props">Props</SectionTitle>
      <SectionSubtitle id="grid-props">Grid props</SectionSubtitle>
      <Text mb="$5">
        Grid composes <Code>Box</Code> so you can pass all the <Code>Box</Code> prop, css grid
        props, and these shorthand prop to save you some time:
      </Text>
      <PropsTable items={gridPropItems} mb="$10" />
      <SectionSubtitle id="grid-item-props">GridItem props</SectionSubtitle>
      <PropsTable items={gridItemPropItems} />
    </PageLayout>
  );
}
