import {
  hope,
  HStack,
  Tag,
  TagCloseButton,
  TagLabel,
  TagLeftIcon,
  TagProps,
  TagRightIcon,
  Text,
  VStack,
} from "@hope-ui/design-system";
import Prism from "prismjs";
import { For, onMount } from "solid-js";

import Code from "@/components/Code";
import CodeSnippet from "@/components/CodeSnippet";
import { ContextualNavLink } from "@/components/ContextualNav";
import PageLayout from "@/components/PageLayout";
import PageTitle from "@/components/PageTitle";
import { Preview } from "@/components/Preview";
import { PropsTable, PropsTableItem } from "@/components/PropsTable";
import SectionSubtitle from "@/components/SectionSubtitle";
import SectionTitle from "@/components/SectionTitle";
import { IconGear } from "@/icons/IconGear";
import { IconPlus } from "@/icons/IconPlus";

import { snippets } from "./snippets";

export default function TagDoc() {
  const previousLink: ContextualNavLink = {
    href: "/docs/data-display/table",
    label: "Table",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/navigation/anchor",
    label: "Anchor",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#import", label: "Import" },
    { href: "#usage", label: "Usage" },
    { href: "#colors", label: "Tag colors", indent: true },
    { href: "#sizes", label: "Tag sizes", indent: true },
    { href: "#variants", label: "Tag variants", indent: true },
    { href: "#with-icon", label: "Tag with icon", indent: true },
    { href: "#with-close-button", label: "Tag with close button", indent: true },
    { href: "#theming", label: "Theming" },
    { href: "#props", label: "Props" },
  ];

  const propItems: PropsTableItem[] = [
    {
      name: "variant",
      description: "The visual style of the tag.",
      type: '"solid" | "subtle" | "outline" | "dot"',
      defaultValue: '"subtle"',
    },
    {
      name: "colorScheme",
      description: "The color of the tag.",
      type: '"primary" | "accent" | "neutral" | "success" | "info" | "warning" | "danger"',
      defaultValue: '"neutral"',
    },
    {
      name: "size",
      description: "The size of the tag.",
      type: '"sm" | "md" | "lg"',
      defaultValue: '"md"',
    },
    {
      name: "dotPlacement",
      description: "Determines the placement of the dot when `variant` is `dot`.",
      type: '"start" | "end"',
      defaultValue: '"start"',
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
      <PageTitle>Tag</PageTitle>
      <Text mb="$5">
        <Code>Tag</Code> component is used for items that need to be labeled, categorized, or
        organized using keywords that describe them.
      </Text>
      <SectionTitle id="import">Import</SectionTitle>
      <CodeSnippet snippet={snippets.importComponent} mb="$6" />
      <hope.ul ps="$6" mb="$12">
        <hope.li mb="$2">
          <strong>Tag:</strong> The wrapper for all the tag elements.
        </hope.li>
        <hope.li mb="$2">
          <strong>TagLabel:</strong> The label for tag's text content.
        </hope.li>
        <hope.li mb="$2">
          <strong>TagLeftIcon:</strong> The icon placed on the left side of the tag.
        </hope.li>
        <hope.li mb="$2">
          <strong>TagRightIcon:</strong> The icon placed on the right side of the tag.
        </hope.li>
        <hope.li>
          <strong>TagCloseButton:</strong> The close button for the tag.
        </hope.li>
      </hope.ul>
      <SectionTitle id="usage">Usage</SectionTitle>
      <Preview snippet={snippets.basicUsage} mb="$10">
        <Tag>Sample Tag</Tag>
      </Preview>
      <SectionSubtitle id="colors">Tag colors</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>colorScheme</Code> prop to change the color of the Tag You can set the value
        to <Code>primary</Code>, <Code>accent</Code>, <Code>neutral</Code>, <Code>success</Code>,{" "}
        <Code>info</Code>, <Code>warning</Code> or <Code>danger</Code>.
      </Text>
      <Preview snippet={snippets.colors} mb="$10">
        <HStack spacing="$4">
          <Tag colorScheme="primary">Tag</Tag>
          <Tag colorScheme="accent">Tag</Tag>
          <Tag colorScheme="neutral">Tag</Tag>
          <Tag colorScheme="success">Tag</Tag>
          <Tag colorScheme="info">Tag</Tag>
          <Tag colorScheme="warning">Tag</Tag>
          <Tag colorScheme="danger">Tag</Tag>
        </HStack>
      </Preview>
      <SectionSubtitle id="sizes">Tag sizes</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>size</Code> prop to change the size of the Tag You can set the value to{" "}
        <Code>sm</Code>, <Code>md</Code> or <Code>lg</Code>.
      </Text>
      <Preview snippet={snippets.sizes} mb="$10">
        <HStack spacing="$4">
          <Tag size="sm">Tag</Tag>
          <Tag size="md">Tag</Tag>
          <Tag size="lg">Tag</Tag>
        </HStack>
      </Preview>
      <SectionSubtitle id="variants">Tag variants</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>variant</Code> prop to change the visual style of the Tag You can set the
        value to <Code>solid</Code>, <Code>subtle</Code>, <Code>outline</Code> or <Code>dot</Code>.
      </Text>
      <Preview snippet={snippets.variants} mb="$8">
        <HStack spacing="$4">
          <Tag variant="solid">Tag</Tag>
          <Tag variant="subtle">Tag</Tag>
          <Tag variant="outline">Tag</Tag>
          <Tag variant="dot" dotPlacement="start">
            Tag
          </Tag>
          <Tag variant="dot" dotPlacement="end">
            Tag
          </Tag>
        </HStack>
      </Preview>
      <Text mb="$5">Overview of all color and variant combination:</Text>
      <Preview mb="$10">
        <VStack alignItems="flex-start" spacing="$4">
          <For each={["solid", "subtle", "outline", "dot"]}>
            {variant => (
              <HStack spacing="$4">
                <For
                  each={["primary", "accent", "neutral", "success", "info", "warning", "danger"]}
                >
                  {colorScheme => (
                    <Tag
                      variant={variant as TagProps["variant"]}
                      colorScheme={colorScheme as TagProps["colorScheme"]}
                    >
                      Tag
                    </Tag>
                  )}
                </For>
              </HStack>
            )}
          </For>
        </VStack>
      </Preview>
      <SectionSubtitle id="with-icon">Tag with icon</SectionSubtitle>
      <Text mb="$5">
        You can add left and right icons to the Tag component using the <Code>TagLeftIcon</Code> and{" "}
        <Code>TagRightIcon</Code> components respectively.
      </Text>
      <Preview snippet={snippets.withLeftIcon} mb="$6">
        <HStack spacing="$4">
          <Tag size="sm">
            <TagLeftIcon as={IconPlus} />
            <TagLabel>Tag</TagLabel>
          </Tag>
          <Tag size="md">
            <TagLeftIcon as={IconPlus} />
            <TagLabel>Tag</TagLabel>
          </Tag>
          <Tag size="lg">
            <TagLeftIcon as={IconPlus} />
            <TagLabel>Tag</TagLabel>
          </Tag>
        </HStack>
      </Preview>
      <Preview snippet={snippets.withRightIcon} mb="$12">
        <HStack spacing="$4">
          <Tag size="sm">
            <TagLabel>Tag</TagLabel>
            <TagRightIcon as={IconGear} />
          </Tag>
          <Tag size="md">
            <TagLabel>Tag</TagLabel>
            <TagRightIcon as={IconGear} />
          </Tag>
          <Tag size="lg">
            <TagLabel>Tag</TagLabel>
            <TagRightIcon as={IconGear} />
          </Tag>
        </HStack>
      </Preview>
      <SectionSubtitle id="with-close-button">Tag with close button</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>TagCloseButton</Code> component to add a close button to the Tag
      </Text>
      <Preview snippet={snippets.withCloseButton} mb="$12">
        <HStack spacing="$4">
          <Tag size="sm">
            <TagLabel>Tag</TagLabel>
            <TagCloseButton />
          </Tag>
          <Tag size="md">
            <TagLabel>Tag</TagLabel>
            <TagCloseButton />
          </Tag>
          <Tag size="lg">
            <TagLabel>Tag</TagLabel>
            <TagCloseButton />
          </Tag>
        </HStack>
      </Preview>
      <SectionTitle id="theming">Theming</SectionTitle>
      <Text mb="$5">
        <Code>Tag</Code> base styles and default props can be overridden in the Hope UI theme
        configuration like below:
      </Text>
      <CodeSnippet lang="js" snippet={snippets.theming} mb="$12" />
      <SectionTitle id="props">Props</SectionTitle>
      <PropsTable items={propItems} />
    </PageLayout>
  );
}
