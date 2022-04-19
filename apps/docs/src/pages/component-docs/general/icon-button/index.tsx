import { hope, HStack, IconButton, Text } from "@hope-ui/solid";
import Prism from "prismjs";
import { onMount } from "solid-js";

import { BeatLoader } from "@/components/BeatLoader";
import Code from "@/components/Code";
import CodeSnippet from "@/components/CodeSnippet";
import { ContextualNavLink } from "@/components/ContextualNav";
import PageLayout from "@/components/PageLayout";
import PageTitle from "@/components/PageTitle";
import { Preview } from "@/components/Preview";
import { PropsTable, PropsTableItem } from "@/components/PropsTable";
import SectionSubtitle from "@/components/SectionSubtitle";
import SectionTitle from "@/components/SectionTitle";
import { IconSearch } from "@/icons/IconSearch";

import { snippets } from "./snippets";

export default function IconButtonDoc() {
  const previousLink: ContextualNavLink = {
    href: "/docs/general/button",
    label: "Button",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/layout/aspect-ratio",
    label: "AspectRatio",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#import", label: "Import" },
    { href: "#usage", label: "Usage" },
    { href: "#button-colors", label: "Button colors", indent: true },
    { href: "#button-sizes", label: "Button sizes", indent: true },
    { href: "#button-variants", label: "Button variants", indent: true },
    { href: "#button-loading-state", label: "Button loading state", indent: true },
    { href: "#accessibility", label: "Accessibility" },
    { href: "#theming", label: "Theming" },
    { href: "#props", label: "Props" },
  ];

  const propItems: PropsTableItem[] = [
    {
      required: true,
      name: "aria-label",
      description: "A label that describes the button.",
      type: "string",
      defaultValue: "",
    },
    {
      name: "icon",
      description: "The icon to be used in the button.",
      type: "JSX.Element",
      defaultValue: "",
    },
    {
      name: "variant",
      description: "The visual style of the button.",
      type: '"solid" | "subtle" | "outline" | "dashed" | "ghost"',
      defaultValue: '"solid"',
    },
    {
      name: "colorScheme",
      description: "The color of the button.",
      type: '"primary" | "accent" | "neutral" | "success" | "info" | "warning" | "danger"',
      defaultValue: '"primary"',
    },
    {
      name: "size",
      description: "The size of the button.",
      type: '"xs" | "sm" | "md" | "lg" | "xl"',
      defaultValue: '"md"',
    },
    {
      name: "compact",
      description: "If `true`, Reduces the button padding.",
      type: "boolean",
      defaultValue: "false",
    },
    {
      name: "disabled",
      description: "If `true`, the button will be disabled.",
      type: "boolean",
      defaultValue: "false",
    },
    {
      name: "loading",
      description: "If `true`, the button will show a loader.",
      type: "boolean",
      defaultValue: "false",
    },
    {
      name: "loader",
      description: "Replace the loader component when `loading` is `true`.",
      type: "JSX.Element",
      defaultValue: "",
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
      <PageTitle>IconButton</PageTitle>
      <Text mb="$8">
        IconButton composes the <Code>Button</Code> component except that it renders only an icon.
      </Text>
      <SectionTitle id="import">Import</SectionTitle>
      <CodeSnippet snippet={snippets.importComponent} mb="$12" />
      <SectionTitle id="usage">Usage</SectionTitle>
      <Preview snippet={snippets.basicUsage} mb="$10">
        <IconButton aria-label="Search" icon={<IconSearch />} />
      </Preview>
      <SectionSubtitle id="button-colors">Button colors</SectionSubtitle>
      <Text mb="$5">
        The <Code>IconButton</Code> component accepts most of the props from the <Code>Button</Code>{" "}
        component, so we can use <Code>colorScheme</Code> prop to change the color of the button.
      </Text>
      <Preview snippet={snippets.buttonColors} mb="$10">
        <HStack spacing="$4">
          <IconButton colorScheme="primary" aria-label="Search" icon={<IconSearch />} />
          <IconButton colorScheme="accent" aria-label="Search" icon={<IconSearch />} />
          <IconButton colorScheme="neutral" aria-label="Search" icon={<IconSearch />} />
          <IconButton colorScheme="success" aria-label="Search" icon={<IconSearch />} />
          <IconButton colorScheme="info" aria-label="Search" icon={<IconSearch />} />
          <IconButton colorScheme="warning" aria-label="Search" icon={<IconSearch />} />
          <IconButton colorScheme="danger" aria-label="Search" icon={<IconSearch />} />
        </HStack>
      </Preview>
      <SectionSubtitle id="button-sizes">Button sizes</SectionSubtitle>
      <Text mb="$5">
        Like the <Code>Button</Code> component, pass the <Code>size</Code> prop to change the size
        of the button.
      </Text>
      <Preview snippet={snippets.buttonSizes} mb="$8">
        <HStack spacing="$4">
          <IconButton size="xs" aria-label="Search" icon={<IconSearch />} />
          <IconButton size="sm" aria-label="Search" icon={<IconSearch />} />
          <IconButton size="md" aria-label="Search" icon={<IconSearch />} />
          <IconButton size="lg" aria-label="Search" icon={<IconSearch />} />
          <IconButton size="xl" aria-label="Search" icon={<IconSearch />} />
        </HStack>
      </Preview>
      <Text mb="$5">
        Use the <Code>compact</Code> prop to reduces the button padding.
      </Text>
      <Preview snippet={snippets.buttonSizesCompact} mb="$10">
        <HStack spacing="$4">
          <IconButton size="xs" compact aria-label="Search" icon={<IconSearch />} />
          <IconButton size="sm" compact aria-label="Search" icon={<IconSearch />} />
          <IconButton size="md" compact aria-label="Search" icon={<IconSearch />} />
          <IconButton size="lg" compact aria-label="Search" icon={<IconSearch />} />
          <IconButton size="xl" compact aria-label="Search" icon={<IconSearch />} />
        </HStack>
      </Preview>
      <SectionSubtitle id="button-variants">Button variants</SectionSubtitle>
      <Text mb="$5">
        Like the <Code>Button</Code> component, pass the <Code>variant</Code> prop to change the
        style of the button.
      </Text>
      <Preview snippet={snippets.buttonVariants} mb="$10">
        <HStack spacing="$4">
          <IconButton variant="solid" aria-label="Search" icon={<IconSearch />} />
          <IconButton variant="subtle" aria-label="Search" icon={<IconSearch />} />
          <IconButton variant="outline" aria-label="Search" icon={<IconSearch />} />
          <IconButton variant="dashed" aria-label="Search" icon={<IconSearch />} />
          <IconButton variant="ghost" aria-label="Search" icon={<IconSearch />} />
        </HStack>
      </Preview>
      <SectionSubtitle id="button-loading-state">Button loading state</SectionSubtitle>
      <Text mb="$5">
        Pass the <Code>loading</Code> prop to show its loading state.
      </Text>
      <Preview snippet={snippets.buttonLoadingState} mb="$8">
        <IconButton loading aria-label="Search" icon={<IconSearch />} />
      </Preview>
      <Text mb="$5">
        You can change the loader element to use custom loaders as per your design requirements.
        Pass the <Code>loader</Code> prop and set it to a custom jsx element.
      </Text>
      <Preview snippet={snippets.buttonCustomLoader} mb="$12">
        <IconButton
          loading
          loader={<BeatLoader boxSize="$6" />}
          aria-label="Search"
          icon={<IconSearch />}
        />
      </Preview>
      <SectionTitle id="accessibility">Accessibility</SectionTitle>
      <hope.ul ps="$5" mb="$12">
        <hope.li mb="$2">
          IconButton has <Code>role</Code> of <Code>button</Code>.
        </hope.li>
        <hope.li mb="$2">
          Since the button is only an icon <Code>aria-label</Code> is required.
        </hope.li>
        <hope.li>When IconButton has focus, Space or Enter activates it.</hope.li>
      </hope.ul>
      <SectionTitle id="theming">Theming</SectionTitle>
      <Text mb="$5">
        <Code>IconButton</Code> base styles and default props can be overridden in the Hope UI theme
        configuration like below:
      </Text>
      <CodeSnippet lang="js" snippet={snippets.theming} mb="$12" />
      <SectionTitle id="props">Props</SectionTitle>
      <PropsTable items={propItems} />
    </PageLayout>
  );
}
