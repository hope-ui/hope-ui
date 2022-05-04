import { Anchor, List, ListIcon, ListItem, OrderedList, Text, UnorderedList } from "@hope-ui/solid";
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
import { IconCheck } from "@/icons/IconCheck";
import { IconCircleDashed } from "@/icons/IconCircleDashed";

import { snippets } from "./snippets";

export default function ListDoc() {
  const previousLink: ContextualNavLink = {
    href: "/docs/data-display/kbd",
    label: "Kbd",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/data-display/table",
    label: "Table",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#import", label: "Import" },
    { href: "#unordered-list", label: "Unordered List" },
    { href: "#ordered-list", label: "Ordered List" },
    { href: "#unstyled-list", label: "Unstyled List with icon" },
    { href: "#props", label: "Props" },
    { href: "#list-props", label: "List props", indent: true },
    { href: "#other-components-props", label: "Other components props", indent: true },
  ];

  const propItems: PropsTableItem[] = [
    {
      name: "spacing",
      description: "The space between each list item.",
      type: 'ResponsiveValue<MarginProps["margin"]>',
    },
    {
      name: "styleType",
      description: "Shorthand for the `list-style-type` css property.",
      type: "Property.ListStyleType",
    },
    {
      name: "stylePosition",
      description: "Shorthand for the `list-style-position` css property.",
      type: "Property.ListStylePosition",
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
      <PageTitle>List</PageTitle>
      <Text mb="$5">
        <Code>List</Code> component is used to display list items. It renders a <Code>ul</Code>{" "}
        element by default.
      </Text>
      <SectionTitle id="import">Import</SectionTitle>
      <CodeSnippet snippet={snippets.importComponent} mb="$12" />
      <SectionTitle id="unordered-list">Unordered List</SectionTitle>
      <Preview snippet={snippets.unorderedList} mb="$12">
        <UnorderedList>
          <ListItem>Clone or download repository from GitHub</ListItem>
          <ListItem>Install dependencies with npm</ListItem>
          <ListItem>To start development server run npm start command</ListItem>
          <ListItem>Run tests to make sure your changes do not break the build</ListItem>
          <ListItem>Submit a pull request once you are done</ListItem>
        </UnorderedList>
      </Preview>
      <SectionTitle id="ordered-list">Ordered List</SectionTitle>
      <Preview snippet={snippets.orderedList} mb="$12">
        <OrderedList>
          <ListItem>Clone or download repository from GitHub</ListItem>
          <ListItem>Install dependencies with npm</ListItem>
          <ListItem>To start development server run npm start command</ListItem>
          <ListItem>Run tests to make sure your changes do not break the build</ListItem>
          <ListItem>Submit a pull request once you are done</ListItem>
        </OrderedList>
      </Preview>
      <SectionTitle id="unstyled-list">Unstyled List with icon</SectionTitle>
      <Text mb="$5">
        Add icons to the list items by using the <Code>ListIcon</Code> component. The size of the
        icon is relative to the font size of the list item.
      </Text>
      <Preview snippet={snippets.unstyledListWithIcon} mb="$12">
        <List spacing="$3">
          <ListItem>
            <ListIcon as={IconCheck} color="$success9" />
            Clone or download repository from GitHub
          </ListItem>
          <ListItem>
            <ListIcon as={IconCheck} color="$success9" />
            Install dependencies with npm
          </ListItem>
          <ListItem>
            <ListIcon as={IconCheck} color="$success9" />
            To start development server run npm start command
          </ListItem>
          <ListItem>
            <ListIcon as={IconCheck} color="$success9" />
            Run tests to make sure your changes do not break the build
          </ListItem>
          <ListItem>
            <ListIcon as={IconCircleDashed} color="$info9" />
            Submit a pull request once you are done
          </ListItem>
        </List>
      </Preview>
      <SectionTitle id="props">Props</SectionTitle>
      <SectionSubtitle id="list-props">List props</SectionSubtitle>
      <PropsTable items={propItems} mb="$10" />
      <SectionSubtitle id="other-components-props">Other components props</SectionSubtitle>
      <UnorderedList spacing="$2">
        <ListItem>
          <Code>ListItem</Code> composes{" "}
          <Anchor as={Link} href="/docs/layout/box" color="$primary11" fontWeight="$semibold">
            Box
          </Anchor>{" "}
          component.
        </ListItem>
        <ListItem>
          <Code>ListIcon</Code> composes{" "}
          <Anchor
            as={Link}
            href="/docs/data-display/icon"
            color="$primary11"
            fontWeight="$semibold"
          >
            Icon
          </Anchor>{" "}
          component.
        </ListItem>
      </UnorderedList>
    </PageLayout>
  );
}
