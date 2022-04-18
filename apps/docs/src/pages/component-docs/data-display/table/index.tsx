import { Table, TableCaption, Tbody, Td, Text, Tfoot, Th, Thead, Tr } from "@hope-ui/design-system";
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

export default function TableDoc() {
  const previousLink: ContextualNavLink = {
    href: "/docs/data-display/list",
    label: "List",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/data-display/tag",
    label: "Tag",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#import", label: "Import" },
    { href: "#usage", label: "Usage" },
    { href: "#striped", label: "Striped table", indent: true },
    { href: "#dense", label: "Dense table", indent: true },
    { href: "#row-highlight", label: "Row highlight", indent: true },
    { href: "#theming", label: "Theming" },
    { href: "#props", label: "Props" },
    { href: "#table-props", label: "Table props", indent: true },
    { href: "#table-caption-props", label: "TableCaption props", indent: true },
    { href: "#th-props", label: "Th props", indent: true },
    { href: "#td-props", label: "Td props", indent: true },
  ];

  const tablePropItems: PropsTableItem[] = [
    {
      name: "striped",
      description: "Set a neutral background color on odd or even row of table.",
      type: '"odd" | "even"',
    },
    {
      name: "dense",
      description: "If `true`, row will have less padding and smaller font size.",
      type: "boolean",
    },
    {
      name: "highlightOnHover",
      description: "If `true`, row will have hover color.",
      type: "boolean",
    },
  ];

  const tableCaptionPropItems: PropsTableItem[] = [
    {
      name: "placement",
      description:
        "The placement of the table caption. This sets the `caption-side` CSS attribute.",
      type: '"top" | "bottom"',
      defaultValue: '"bottom"',
    },
  ];

  const thPropItems: PropsTableItem[] = [
    {
      name: "numeric",
      description: "Aligns the cell content to the right.",
      type: "boolean",
    },
  ];

  const tdPropItems: PropsTableItem[] = [
    {
      name: "numeric",
      description: "Aligns the cell content to the right.",
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
      <PageTitle>Table</PageTitle>
      <Text mb="$5">
        Tables are used to organize and display data efficiently. It renders a <Code>table</Code>{" "}
        element by default.
      </Text>
      <SectionTitle id="import">Import</SectionTitle>
      <CodeSnippet snippet={snippets.importComponent} mb="$12" />
      <SectionTitle id="usage">Usage</SectionTitle>
      <Preview snippet={snippets.basicUsage} mb="$12">
        <Table>
          <TableCaption>Imperial to metric conversion factors</TableCaption>
          <Thead>
            <Tr>
              <Th>To convert</Th>
              <Th>into</Th>
              <Th numeric>multiply by</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>inches</Td>
              <Td>millimetres (mm)</Td>
              <Td numeric>25.4</Td>
            </Tr>
            <Tr>
              <Td>feet</Td>
              <Td>centimetres (cm)</Td>
              <Td numeric>30.48</Td>
            </Tr>
            <Tr>
              <Td>yards</Td>
              <Td>metres (m)</Td>
              <Td numeric>0.91444</Td>
            </Tr>
          </Tbody>
          <Tfoot>
            <Tr>
              <Th>To convert</Th>
              <Th>into</Th>
              <Th numeric>multiply by</Th>
            </Tr>
          </Tfoot>
        </Table>
      </Preview>
      <SectionTitle id="striped">Striped table</SectionTitle>
      <Text mb="$5">
        Use the <Code>striped</Code> prop to render striped rows. You can set the value to{" "}
        <Code>even</Code> or <Code>odd</Code>.
      </Text>
      <Preview snippet={snippets.striped} mb="$12">
        <Table striped="odd">
          <TableCaption>Imperial to metric conversion factors</TableCaption>
          <Thead>
            <Tr>
              <Th>To convert</Th>
              <Th>into</Th>
              <Th numeric>multiply by</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>inches</Td>
              <Td>millimetres (mm)</Td>
              <Td numeric>25.4</Td>
            </Tr>
            <Tr>
              <Td>feet</Td>
              <Td>centimetres (cm)</Td>
              <Td numeric>30.48</Td>
            </Tr>
            <Tr>
              <Td>yards</Td>
              <Td>metres (m)</Td>
              <Td numeric>0.91444</Td>
            </Tr>
          </Tbody>
          <Tfoot>
            <Tr>
              <Th>To convert</Th>
              <Th>into</Th>
              <Th numeric>multiply by</Th>
            </Tr>
          </Tfoot>
        </Table>
      </Preview>
      <SectionTitle id="dense">Dense table</SectionTitle>
      <Text mb="$5">
        Use the <Code>dense</Code> prop to reduce the table size.
      </Text>
      <Preview snippet={snippets.dense} mb="$12">
        <Table dense>
          <TableCaption>Imperial to metric conversion factors</TableCaption>
          <Thead>
            <Tr>
              <Th>To convert</Th>
              <Th>into</Th>
              <Th numeric>multiply by</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>inches</Td>
              <Td>millimetres (mm)</Td>
              <Td numeric>25.4</Td>
            </Tr>
            <Tr>
              <Td>feet</Td>
              <Td>centimetres (cm)</Td>
              <Td numeric>30.48</Td>
            </Tr>
            <Tr>
              <Td>yards</Td>
              <Td>metres (m)</Td>
              <Td numeric>0.91444</Td>
            </Tr>
          </Tbody>
          <Tfoot>
            <Tr>
              <Th>To convert</Th>
              <Th>into</Th>
              <Th numeric>multiply by</Th>
            </Tr>
          </Tfoot>
        </Table>
      </Preview>
      <SectionTitle id="row-highlight">Row highlight</SectionTitle>
      <Text mb="$5">
        Use the <Code>highlightOnHover</Code> prop to highlight row on hover.
      </Text>
      <Preview snippet={snippets.highlightOnHover} mb="$12">
        <Table highlightOnHover>
          <TableCaption>Imperial to metric conversion factors</TableCaption>
          <Thead>
            <Tr>
              <Th>To convert</Th>
              <Th>into</Th>
              <Th numeric>multiply by</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>inches</Td>
              <Td>millimetres (mm)</Td>
              <Td numeric>25.4</Td>
            </Tr>
            <Tr>
              <Td>feet</Td>
              <Td>centimetres (cm)</Td>
              <Td numeric>30.48</Td>
            </Tr>
            <Tr>
              <Td>yards</Td>
              <Td>metres (m)</Td>
              <Td numeric>0.91444</Td>
            </Tr>
          </Tbody>
          <Tfoot>
            <Tr>
              <Th>To convert</Th>
              <Th>into</Th>
              <Th numeric>multiply by</Th>
            </Tr>
          </Tfoot>
        </Table>
      </Preview>
      <SectionTitle id="theming">Theming</SectionTitle>
      <Text mb="$5">
        <Code>Table</Code> base styles and default props can be overridden in the Hope UI theme
        configuration like below:
      </Text>
      <CodeSnippet lang="js" snippet={snippets.theming} mb="$12" />
      <SectionTitle id="props">Props</SectionTitle>
      <SectionSubtitle id="table-props">Table props</SectionSubtitle>
      <PropsTable items={tablePropItems} mb="$10" />
      <SectionSubtitle id="table-caption-props">TableCaption props</SectionSubtitle>
      <PropsTable items={tableCaptionPropItems} mb="$10" />
      <SectionSubtitle id="th-props">Th props</SectionSubtitle>
      <PropsTable items={thPropItems} mb="$10" />
      <SectionSubtitle id="td-props">Td props</SectionSubtitle>
      <PropsTable items={tdPropItems} />
    </PageLayout>
  );
}
