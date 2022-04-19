import { Anchor, Button, Flex, HStack, Text, Tooltip, VStack } from "@hope-ui/solid";
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
import { IconSearch } from "@/icons/IconSearch";

import { snippets } from "./snippets";

export default function TooltipDoc() {
  const previousLink: ContextualNavLink = {
    href: "/docs/overlay/popover",
    label: "Popover",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/others/close-button",
    label: "CloseButton",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#import", label: "Import" },
    { href: "#usage", label: "Usage" },
    { href: "#with-arrow", label: "Tooltip with arrow", indent: true },
    { href: "#with-focusable-content", label: "Tooltip with focusable content", indent: true },
    { href: "#disabled-tooltip", label: "Disabled tooltip", indent: true },
    { href: "#placement", label: "Placement" },
    { href: "#more-examples", label: "More examples" },
    { href: "#theming", label: "Theming" },
    { href: "#props", label: "Props" },
  ];

  const propItems: PropsTableItem[] = [
    {
      name: "opened",
      description: "If `true`, the tooltip will be shown (in controlled mode).",
      type: "boolean",
    },
    {
      name: "defaultOpened",
      description: "If `true`, the tooltip will be initially shown.",
      type: "boolean",
    },
    {
      name: "label",
      description: "The label of the tooltip.",
      type: "JSX.Element",
    },
    {
      name: "aria-label",
      description:
        "The accessible, human friendly label to use for screen readers. If passed, tooltip will show the content `label` but expose only `aria-label` to assistive technologies",
      type: "string",
    },
    {
      name: "id",
      description: "The id of the tooltip.",
      type: "string",
    },
    {
      name: "placement",
      description: "The placement of the tooltip relative to its reference.",
      type: "Placement",
      defaultValue: '"bottom"',
    },
    {
      name: "offset",
      description: "The offset between the tooltip and the reference (trigger) element.",
      type: "number",
      defaultValue: "8",
    },
    {
      name: "inline",
      description:
        "If `true`, apply @floating-ui/dom `inline` middleware. Useful for inline reference elements that span over multiple lines, such as hyperlinks or range selections.",
      type: "boolean",
    },
    {
      name: "disabled",
      description: "If `true`, the tooltip will not show.",
      type: "boolean",
    },
    {
      name: "withArrow",
      description: "If `true`, the tooltip will show an arrow tip.",
      type: "boolean",
      defaultValue: "false",
    },
    {
      name: "arrowSize",
      description: "Size of the arrow.",
      type: "number",
      defaultValue: "8",
    },
    {
      name: "arrowPadding",
      description: "The padding between the arrow and the edges of the tooltip.",
      type: "number",
      defaultValue: "8",
    },
    {
      name: "openDelay",
      description: "Delay (in ms) before showing the tooltip.",
      type: "number",
      defaultValue: "0",
    },
    {
      name: "closeDelay",
      description: "Delay (in ms) before hiding the tooltip.",
      type: "number",
      defaultValue: "0",
    },
    {
      name: "closeOnClick",
      description: "If `true`, the tooltip will hide on click.",
      type: "boolean",
      defaultValue: "true",
    },
    {
      name: "closeOnMouseDown",
      description: "If `true`, the tooltip will hide while the mouse is down.",
      type: "boolean",
      defaultValue: "false",
    },
    {
      name: "onOpen",
      description: "Callback to run when the tooltip shows.",
      type: "() => void",
    },
    {
      name: "onClose",
      description: "Callback to run when the tooltip hides.",
      type: "() => void",
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
      <PageTitle>Tooltip</PageTitle>
      <Text mb="$5">
        A tooltip is a brief, informative message that appears when a user interacts with an
        element. Tooltips are usually initiated in one of two ways: through a mouse-hover gesture or
        through a keyboard-hover gesture.
      </Text>
      <Text mb="$5">
        The <Code>Tooltip</Code> component follows the{" "}
        <Anchor
          href="https://www.w3.org/TR/wai-aria-practices/#tooltip"
          external
          color="$primary11"
          fontWeight="$semibold"
        >
          WAI-ARIA
        </Anchor>{" "}
        Tooltip Pattern.
      </Text>
      <SectionTitle id="import">Import</SectionTitle>
      <CodeSnippet snippet={snippets.importComponent} mb="$12" />
      <SectionTitle id="usage">Usage</SectionTitle>
      <Text mb="$5"></Text>
      <Preview snippet={snippets.basicUsage} mb="$10">
        <Tooltip label="Hey, I'm here!">
          <span>Hover me</span>
        </Tooltip>
      </Preview>
      <SectionSubtitle id="with-arrow">Tooltip with arrow</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>withArrow</Code> prop to add an arrow to the tooltip.
      </Text>
      <Preview snippet={snippets.withArrow} mb="$10">
        <Tooltip withArrow label="Search places">
          <IconSearch boxSize="20px" />
        </Tooltip>
      </Preview>
      <SectionSubtitle id="with-focusable-content">Tooltip with focusable content</SectionSubtitle>
      <Text mb="$5">
        If the children of the tooltip is a focusable element, the tooltip will show when you focus
        or hover on the element, and will hide when you blur or move cursor out of the element.
      </Text>
      <Preview snippet={snippets.withFocusableContent} mb="$10">
        <Tooltip label="Search places">
          <Button>Button</Button>
        </Tooltip>
      </Preview>
      <SectionSubtitle id="disabled-tooltip">Disabled tooltip</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>disabled</Code> prop to prevent the tooltip from showing up.
      </Text>
      <Preview snippet={snippets.disabled} mb="$12">
        <Tooltip disabled>
          <IconSearch boxSize="20px" />
        </Tooltip>
      </Preview>
      <SectionTitle id="placement">Placement</SectionTitle>
      <Text mb="$5">
        Using the <Code>placement</Code> prop you can adjust where your tooltip will be displayed.
      </Text>
      <Preview snippet={snippets.placement} mb="$12">
        <VStack spacing="$6">
          <HStack spacing="$6">
            <Tooltip label="Top start" placement="top-start">
              <Button>Top-Start</Button>
            </Tooltip>

            <Tooltip label="Top" placement="top">
              <Button>Top</Button>
            </Tooltip>

            <Tooltip label="Top end" placement="top-end">
              <Button>Top-End</Button>
            </Tooltip>
          </HStack>

          <HStack spacing="$6">
            <Tooltip label="Right start" placement="right-start">
              <Button>Right-Start</Button>
            </Tooltip>

            <Tooltip label="Right" placement="right">
              <Button>Right</Button>
            </Tooltip>

            <Tooltip label="Right end" placement="right-end">
              <Button>Right-End</Button>
            </Tooltip>
          </HStack>

          <HStack spacing="$6">
            <Tooltip label="Bottom start" placement="bottom-start">
              <Button>Bottom Start</Button>
            </Tooltip>

            <Tooltip label="Bottom" placement="bottom">
              <Button>Bottom</Button>
            </Tooltip>

            <Tooltip label="Bottom end" placement="bottom-end">
              <Button>Bottom End</Button>
            </Tooltip>
          </HStack>

          <HStack spacing="$6">
            <Tooltip label="Left start" placement="left-start">
              <Button>Left-Start</Button>
            </Tooltip>

            <Tooltip label="Left" placement="left">
              <Button>Left</Button>
            </Tooltip>

            <Tooltip label="Left end" placement="left-end">
              <Button>Left-End</Button>
            </Tooltip>
          </HStack>
        </VStack>
      </Preview>
      <SectionTitle id="more-examples">More examples</SectionTitle>
      <Preview snippet={snippets.moreExamples} mb="$12">
        <Flex wrap="wrap" gap="$6">
          <Tooltip label="I close on click">
            <Button>Close on Click - true(default)</Button>
          </Tooltip>

          <Tooltip label="I don't close on click" closeOnClick={false}>
            <Button>Close on Click - false</Button>
          </Tooltip>

          <Tooltip label="I am always open" placement="top" opened>
            <Button>Always Open</Button>
          </Tooltip>

          <Tooltip label="I am open by default" placement="left" defaultOpened>
            <Button>Open on startup</Button>
          </Tooltip>

          <Tooltip label="Opened after 500ms" openDelay={500}>
            <Button>Delay Open - 500ms</Button>
          </Tooltip>

          <Tooltip label="Closed after 500ms" closeDelay={500}>
            <Button>Delay Close - 500ms</Button>
          </Tooltip>

          <Tooltip label="I have 12px arrow" withArrow arrowSize={12}>
            <Button>Arrow size - 12px</Button>
          </Tooltip>
        </Flex>
      </Preview>
      <SectionTitle id="theming">Theming</SectionTitle>
      <Text mb="$5">
        <Code>Tooltip</Code> base styles and default props can be overridden in the Hope UI theme
        configuration like below:
      </Text>
      <CodeSnippet lang="js" snippet={snippets.theming} mb="$12" />
      <SectionTitle id="props">Props</SectionTitle>
      <PropsTable items={propItems} />
    </PageLayout>
  );
}
