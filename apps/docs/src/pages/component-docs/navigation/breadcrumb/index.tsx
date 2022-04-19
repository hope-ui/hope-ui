import {
  Anchor,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  ListItem,
  Text,
  UnorderedList,
} from "@hope-ui/solid";
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
import { IconChevronRight } from "@/icons/IconChevronRight";

import { snippets } from "./snippets";

export default function BreadcrumbDoc() {
  const previousLink: ContextualNavLink = {
    href: "/docs/navigation/anchor",
    label: "Anchor",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/navigation/tabs",
    label: "Tabs",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#import", label: "Import" },
    { href: "#usage", label: "Usage" },
    { href: "#separator", label: "Breadcrumb separator", indent: true },
    { href: "#icon-as-separator", label: "Using icon as separator", indent: true },
    { href: "#with-end-separator", label: "Using end separator", indent: true },
    { href: "#spacing", label: "Separator spacing", indent: true },
    { href: "#composition", label: "Composition" },
    { href: "#with-routing-library", label: "Usage with routing library" },
    { href: "#accessibility", label: "Accessibility" },
    { href: "#theming", label: "Theming" },
    { href: "#props", label: "Props" },
    { href: "#breadcrumb-props", label: "Breadcrumb props", indent: true },
    { href: "#breadcrumb-link-props", label: "BreadcrumbLink props", indent: true },
    { href: "#other-components-props", label: "Other components props", indent: true },
  ];

  const breadcrumbPropItems: PropsTableItem[] = [
    {
      name: "spacing",
      description: "The left and right space applied to each separator.",
      type: 'ResponsiveValue<GridLayoutProps["gap"]>',
      defaultValue: "0.5rem",
    },
    {
      name: "separator",
      description: "The visual separator between each breadcrumb item.",
      type: "string | JSX.Element",
      defaultValue: "/",
    },
  ];

  const breadcrumbLinkPropItems: PropsTableItem[] = [
    {
      name: "currentPage",
      description:
        "If `true`, renders a span with `aria-current` set to `page` instead of an anchor element.",
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
      <PageTitle>Breadcrumb</PageTitle>
      <Text mb="$5">
        Breadcrumbs, or a breadcrumb navigation, can help enhance how users navigate to previous
        page levels of a website, especially if that website has many pages or products.
      </Text>
      <SectionTitle id="import">Import</SectionTitle>
      <CodeSnippet snippet={snippets.importComponent} mb="$6" />
      <UnorderedList spacing="$2" mb="$12">
        <ListItem>
          <strong>Breadcrumb:</strong> The parent container for breadcrumbs.
        </ListItem>
        <ListItem>
          <strong>BreadcrumbItem:</strong> Individual breadcrumb element containing a link and
          separator.
        </ListItem>
        <ListItem>
          <strong>BreadcrumbLink:</strong> The breadcrumb link.
        </ListItem>
        <ListItem>
          <strong>BreadcrumbSeparator:</strong> The visual separator between each breadcrumb.
        </ListItem>
      </UnorderedList>
      <SectionTitle id="usage">Usage</SectionTitle>
      <Text mb="$5">
        Add the <Code>currentPage</Code> prop to the <Code>BreadcrumbLink</Code> that matches the
        current path. When this prop is present, the <Code>BreadcrumbLink</Code> renders a{" "}
        <Code>span</Code> with <Code>aria-current</Code> set to <Code>page</Code> instead of an
        anchor element.
      </Text>
      <Preview snippet={snippets.basicUsage} mb="$10">
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Home</BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Docs</BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink currentPage>Breadcrumb</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </Preview>
      <SectionSubtitle id="separator">Breadcrumb separator</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>separator</Code> prop to change the separator used in the breadcrumb.
      </Text>
      <Preview snippet={snippets.separator} mb="$10">
        <Breadcrumb separator="-">
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Home</BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Docs</BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink currentPage>Breadcrumb</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </Preview>
      <SectionSubtitle id="icon-as-separator">Using icon as separator</SectionSubtitle>
      <Text mb="$5">
        You can pass any <Code>JSX.Element</Code> to the <Code>separator</Code> prop.
      </Text>
      <Preview snippet={snippets.iconSeparator} mb="$10">
        <Breadcrumb separator={<IconChevronRight color="$neutral11" />}>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Home</BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Docs</BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink currentPage>Breadcrumb</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </Preview>
      <SectionSubtitle id="with-end-separator">Using end separator</SectionSubtitle>
      <Text mb="$5">
        To append a separator to the last breadcrumb item, just add a{" "}
        <Code>BreadcrumbSeparator</Code> component.
      </Text>
      <Preview snippet={snippets.withEndSeparator} mb="$10">
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Home</BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Docs</BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink currentPage>Breadcrumb</BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
        </Breadcrumb>
      </Preview>
      <SectionSubtitle id="spacing">Separator spacing</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>spacing</Code> prop to apply left and right margin to each separator.
      </Text>
      <Preview snippet={snippets.spacing} mb="$12">
        <Breadcrumb spacing="$4">
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Home</BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Docs</BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink currentPage>Breadcrumb</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </Preview>
      <SectionTitle id="composition">Composition</SectionTitle>
      <Text mb="$5">
        Breadcrumb composes{" "}
        <Anchor as={Link} href="/docs/layout/box" color="$primary11" fontWeight="$semibold">
          Box
        </Anchor>{" "}
        so you can pass all <Code>Box</Code> props to change the style of the breadcrumbs.
      </Text>
      <Preview snippet={snippets.composition} mb="$12">
        <Breadcrumb fontWeight="$medium" fontSize="$sm" spacing="$4">
          <BreadcrumbItem>
            <BreadcrumbLink href="#" _hover={{ color: "tomato" }}>
              Home
            </BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="#" _hover={{ color: "tomato" }}>
              Docs
            </BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink currentPage _hover={{ color: "$success10" }}>
              Breadcrumb
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </Preview>
      <SectionTitle id="with-routing-library">Usage with routing library</SectionTitle>
      <Text mb="$5">
        To use the Breadcrumb with a routing Library like <Code>solid-app-router</Code>, all you
        need to do is to pass the <Code>as</Code> prop to the <Code>BreadcrumbLink</Code> component.
      </Text>
      <Preview snippet={snippets.withRoutingLibrary} mb="$12">
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} href="#">
              Home
            </BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} href="#">
              Docs
            </BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink currentPage>Breadcrumb</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </Preview>
      <SectionTitle id="accessibility">Accessibility</SectionTitle>
      <UnorderedList spacing="$2" mb="$12">
        <ListItem>
          The Breadcrumbs are rendered in a <Code>nav</Code> to denote that it is a navigation
          landmark.
        </ListItem>
        <ListItem>
          The Breadcrumb <Code>nav</Code> has <Code>aria-label</Code> set to <Code>breadcrumb</Code>
          .
        </ListItem>
        <ListItem>
          The <Code>BreadcrumbLink</Code> with <Code>currentPage</Code> prop has{" "}
          <Code>aria-current</Code> set to <Code>page</Code>.
        </ListItem>
        <ListItem>
          The separator has <Code>role</Code> set to <Code>presentation</Code> to denote that its
          for presentation purposes.
        </ListItem>
      </UnorderedList>
      <SectionTitle id="theming">Theming</SectionTitle>
      <Text mb="$5">
        <Code>Breadcrumb</Code> base styles and default props can be overridden in the Hope UI theme
        configuration like below:
      </Text>
      <CodeSnippet lang="js" snippet={snippets.theming} mb="$12" />
      <SectionTitle id="props">Props</SectionTitle>
      <SectionSubtitle id="breadcrumb-props">Breadcrumb props</SectionSubtitle>
      <PropsTable items={breadcrumbPropItems} mb="$10" />
      <SectionSubtitle id="breadcrumb-link-props">BreadcrumbLink props</SectionSubtitle>
      <PropsTable items={breadcrumbLinkPropItems} mb="$10" />
      <SectionSubtitle id="other-components-props">Other components props</SectionSubtitle>

      <Text>
        <Code>BreadcrumbItem</Code> and <Code>BreadcrumbSeparator</Code> composes{" "}
        <Anchor as={Link} href="/docs/layout/box" color="$primary11" fontWeight="$semibold">
          Box
        </Anchor>{" "}
        component.
      </Text>
    </PageLayout>
  );
}
