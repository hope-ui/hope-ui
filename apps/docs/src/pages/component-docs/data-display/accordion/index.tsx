import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Alert,
  AlertDescription,
  Anchor,
  Button,
  HStack,
  Kbd,
  ListItem,
  Text,
  UnorderedList,
} from "@hope-ui/solid";
import Prism from "prismjs";
import { Link } from "solid-app-router";
import { createSignal, onMount } from "solid-js";

import Code from "@/components/Code";
import CodeSnippet from "@/components/CodeSnippet";
import { ContextualNavLink } from "@/components/ContextualNav";
import PageLayout from "@/components/PageLayout";
import PageTitle from "@/components/PageTitle";
import { Preview } from "@/components/Preview";
import { PropsTable, PropsTableItem } from "@/components/PropsTable";
import SectionSubtitle from "@/components/SectionSubtitle";
import SectionTitle from "@/components/SectionTitle";
import { IconMinus } from "@/icons/IconMinus";
import { IconPlus } from "@/icons/IconPlus";

import { snippets } from "./snippets";

export default function AccordionDoc() {
  const [itemIndex, setItemIndex] = createSignal(-1);

  const previousLink: ContextualNavLink = {
    href: "/docs/data-entry/textarea",
    label: "Textarea",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/data-display/avatar",
    label: "Avatar",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#import", label: "Import" },
    { href: "#usage", label: "Usage" },
    { href: "#default-expanded-item", label: "Default expanded item", indent: true },
    { href: "#expand-multiple-items", label: "Expand multiple items at once", indent: true },
    { href: "#styling-expanded-state", label: "Styling the expanded state", indent: true },
    { href: "#accessing-internal-state", label: "Accessing the internal state", indent: true },
    { href: "#controlled-accordion", label: "Controlled accordion", indent: true },
    { href: "#accessibility", label: "Accessibility" },
    { href: "#theming", label: "Theming" },
    { href: "#props", label: "Props" },
    { href: "#accordion-props", label: "Accordion props", indent: true },
    { href: "#accordion-item-props", label: "AccordionItem props", indent: true },
    { href: "#other-components-props", label: "Other components props", indent: true },
  ];

  const accordionPropItems: PropsTableItem[] = [
    {
      name: "allowMultiple",
      description: "If `true`, multiple accordion items can be expanded at once.",
      type: "boolean",
      defaultValue: "false",
    },
    {
      name: "index",
      description: "The index(es) of the expanded accordion item (in controlled mode).",
      type: "number | number[]",
    },
    {
      name: "defaultIndex",
      description: "The initial index(es) of the expanded accordion item (in uncontrolled mode).",
      type: "number | number[]",
    },
    {
      name: "onChange",
      description: "The callback invoked when accordion items are expanded or collapsed.",
      type: "(expandedIndex: number | number[]) => void",
    },
  ];

  const accordionItemPropItems: PropsTableItem[] = [
    {
      name: "disabled",
      description: "If `true`, the accordion item will be disabled.",
      type: "boolean",
    },
    {
      name: "children",
      description:
        "The children of the accordion item. Can be a render props that exposes the internal `expanded` and `disabled` state.",
      type: "JSX.Element | (props: { expanded: Accessor<boolean>; disabled: Accessor<boolean>; }) => JSX.Element",
    },
  ];

  onMount(() => {
    Prism.highlightAll();
  });

  return (
    <PageLayout previousLink={previousLink} nextLink={nextLink} contextualNavLinks={contextualNavLinks}>
      <PageTitle>Accordion</PageTitle>
      <Text mb="$5">
        Accordions display a list of high-level options that can expand/collapse to reveal more information.
      </Text>
      <SectionTitle id="import">Import</SectionTitle>
      <CodeSnippet snippet={snippets.importComponent} mb="$6" />
      <UnorderedList spacing="$2" mb="$12">
        <ListItem>
          <strong>Accordion:</strong> The wrapper components that provides context for all its children.
        </ListItem>
        <ListItem>
          <strong>AccordionItem:</strong> A single accordion item.
        </ListItem>
        <ListItem>
          <strong>AccordionButton:</strong> The button that toggles the expand/collapse state of the accordion item.
          This button must be wrapped in an element with role <Code>heading</Code>.
        </ListItem>
        <ListItem>
          <strong>AccordionIcon:</strong> A <Code>caret-down</Code> icon that rotates based on the expanded/collapsed
          state.
        </ListItem>
        <ListItem>
          <strong>AccordionPanel:</strong> The container for the details to be revealed.
        </ListItem>
      </UnorderedList>
      <SectionTitle id="usage">Usage</SectionTitle>
      <Preview snippet={snippets.basicUsage} mb="$10">
        <Accordion>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Text flex={1} fontWeight="$medium" textAlign="start">
                  Composable
                </Text>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel>Compose your application interface with reusable building blocks.</AccordionPanel>
          </AccordionItem>

          <AccordionItem>
            <h2>
              <AccordionButton>
                <Text flex={1} fontWeight="$medium" textAlign="start">
                  Accessible
                </Text>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel>
              Hope UI follows WAI-ARIA standards, helping you to reach the largest audience possible with less effort.
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Preview>
      <SectionSubtitle id="default-expanded-item">Default expanded item</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>defaultIndex</Code> prop to set an item expanded by default.
      </Text>
      <Preview snippet={snippets.defaultIndex} mb="$10">
        <Accordion defaultIndex={1}>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Text flex={1} fontWeight="$medium" textAlign="start">
                  Composable
                </Text>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel>Compose your application interface with reusable building blocks.</AccordionPanel>
          </AccordionItem>

          <AccordionItem>
            <h2>
              <AccordionButton>
                <Text flex={1} fontWeight="$medium" textAlign="start">
                  Accessible
                </Text>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel>
              Hope UI follows WAI-ARIA standards, helping you to reach the largest audience possible with less effort.
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Preview>
      <SectionSubtitle id="expand-multiple-items">Expand multiple items at once</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>allowMultiple</Code> prop to permit multiple items to be expanded at once.
      </Text>
      <Preview snippet={snippets.allowMultiple} mb="$6">
        <Accordion allowMultiple>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Text flex={1} fontWeight="$medium" textAlign="start">
                  Composable
                </Text>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel>Compose your application interface with reusable building blocks.</AccordionPanel>
          </AccordionItem>

          <AccordionItem>
            <h2>
              <AccordionButton>
                <Text flex={1} fontWeight="$medium" textAlign="start">
                  Accessible
                </Text>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel>
              Hope UI follows WAI-ARIA standards, helping you to reach the largest audience possible with less effort.
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Preview>
      <Alert status="warning" mb="$10">
        <AlertDescription>
          If you pass this prop, ensure that the <Code>index</Code> or <Code>defaultIndex</Code> prop is an array.
        </AlertDescription>
      </Alert>
      <SectionSubtitle id="styling-expanded-state">Styling the expanded state</SectionSubtitle>
      <Text mb="$5">
        The <Code>AccordionButton</Code> component has <Code>aria-expanded</Code> set to <Code>true</Code> or{" "}
        <Code>false</Code> depending on the state of the <Code>AccordionItem</Code>. That means you can use the{" "}
        <Code>_expanded</Code> style prop to style this state.
      </Text>
      <Preview snippet={snippets.stylingExpandedState} mb="$10">
        <Accordion>
          <AccordionItem>
            <h2>
              <AccordionButton _expanded={{ bg: "tomato", color: "white" }}>
                <Text flex={1} fontWeight="$medium" textAlign="start">
                  Composable
                </Text>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel>Compose your application interface with reusable building blocks.</AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Preview>
      <SectionSubtitle id="accessing-internal-state">Accessing the internal state</SectionSubtitle>
      <Text mb="$5">
        If you need access to the internal state of each accordion item, you can use a render prop. It provides 2
        internal state props: <Code>expanded</Code> and <Code>disabled</Code>.
      </Text>
      <Preview snippet={snippets.internalState} mb="$10">
        <Accordion>
          <AccordionItem>
            {({ expanded }) => (
              <>
                <h2>
                  <AccordionButton>
                    <Text flex={1} fontWeight="$medium" textAlign="start">
                      Composable
                    </Text>
                    <AccordionIcon fontSize="1em" as={expanded() ? IconMinus : IconPlus} />
                  </AccordionButton>
                </h2>
                <AccordionPanel>Compose your application interface with reusable building blocks.</AccordionPanel>
              </>
            )}
          </AccordionItem>
        </Accordion>
      </Preview>
      <SectionSubtitle id="controlled-accordion">Controlled accordion</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>index</Code> and <Code>onChange</Code> props to control the <Code>Accordion</Code>.
      </Text>
      <Preview snippet={snippets.controlled} mb="$12">
        <HStack spacing="$4" mb="$4">
          <Button variant="subtle" colorScheme="neutral" onClick={() => setItemIndex(0)}>
            Open item 1
          </Button>
          <Button variant="subtle" colorScheme="neutral" onClick={() => setItemIndex(1)}>
            Open item 2
          </Button>
        </HStack>
        <Accordion index={itemIndex()} onChange={value => setItemIndex(value as number)}>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Text flex={1} fontWeight="$medium" textAlign="start">
                  Composable
                </Text>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel>Compose your application interface with reusable building blocks.</AccordionPanel>
          </AccordionItem>

          <AccordionItem>
            <h2>
              <AccordionButton>
                <Text flex={1} fontWeight="$medium" textAlign="start">
                  Accessible
                </Text>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel>
              Hope UI follows WAI-ARIA standards, helping you to reach the largest audience possible with less effort.
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Preview>
      <SectionTitle id="accessibility">Accessibility</SectionTitle>
      <SectionSubtitle>ARIA roles and attributes</SectionSubtitle>
      <UnorderedList spacing="$2" mb="$8">
        <ListItem>
          Each <Code>AccordionButton</Code> should be wrapped in an element with role <Code>heading</Code>.
        </ListItem>
        <ListItem>
          <Code>AccordionButton</Code> as <Code>role</Code> set to <Code>button</Code>.
        </ListItem>
        <ListItem>
          <Code>AccordionButton</Code> as <Code>aria-controls</Code> set to the <Code>id</Code> of its associated{" "}
          <Code>AccordionPanel</Code>.
        </ListItem>
        <ListItem>
          <Code>AccordionButton</Code> as <Code>aria-expanded</Code> set to <Code>true</Code> when its associated{" "}
          <Code>AccordionPanel</Code> is expanded, <Code>false</Code> otherwise.
        </ListItem>
        <ListItem>
          <Code>AccordionPanel</Code> as <Code>role</Code> set to <Code>region</Code>.
        </ListItem>
        <ListItem>
          <Code>AccordionPanel</Code> as <Code>aria-labelledby</Code> set to the <Code>id</Code> of its associated{" "}
          <Code>AccordionButton</Code>.
        </ListItem>
      </UnorderedList>
      <SectionSubtitle>Keyboard support</SectionSubtitle>
      <UnorderedList spacing="$2" mb="$12">
        <ListItem>
          <Kbd>↑</Kbd> moves focus to the previous accordion button.
        </ListItem>
        <ListItem>
          <Kbd>↓</Kbd> moves focus to the next accordion button.
        </ListItem>
        <ListItem>
          <Kbd>home</Kbd> moves focus to the first accordion button.
        </ListItem>
        <ListItem>
          <Kbd>end</Kbd> moves focus to the last accordion button.
        </ListItem>
      </UnorderedList>
      <SectionTitle id="theming">Theming</SectionTitle>
      <Text mb="$5">
        <Code>Accordion</Code> base styles and default props can be overridden in the Hope UI theme configuration like
        below:
      </Text>
      <CodeSnippet lang="js" snippet={snippets.theming} mb="$12" />
      <SectionTitle id="props">Props</SectionTitle>
      <SectionSubtitle id="accordion-props">Accordion props</SectionSubtitle>
      <PropsTable items={accordionPropItems} mb="$10" />
      <SectionSubtitle id="accordion-item-props">AccordionItem props</SectionSubtitle>
      <PropsTable items={accordionItemPropItems} mb="$10" />
      <SectionSubtitle id="other-components-props">Other components props</SectionSubtitle>
      <UnorderedList spacing="$2">
        <ListItem>
          <Code>AccordionButton</Code> and <Code>AccordionPanel</Code> composes{" "}
          <Anchor as={Link} href="/docs/layout/box" external color="$primary11" fontWeight="$semibold">
            Box
          </Anchor>
          .
        </ListItem>
        <ListItem>
          <Code>AccordionIcon</Code> composes{" "}
          <Anchor as={Link} href="/docs/data-display/icon" external color="$primary11" fontWeight="$semibold">
            Icon
          </Anchor>
          .
        </ListItem>
      </UnorderedList>
    </PageLayout>
  );
}
