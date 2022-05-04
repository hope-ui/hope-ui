import {
  Anchor,
  Input,
  Kbd,
  ListItem,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  TabsProps,
  Text,
  UnorderedList,
  VStack,
} from "@hope-ui/solid";
import Prism from "prismjs";
import { Link } from "solid-app-router";
import { createSignal, For, JSX, onMount } from "solid-js";

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

export default function TabsDoc() {
  const [tabIndex, setTabIndex] = createSignal(0);

  const handleSliderChange: JSX.EventHandlerUnion<HTMLInputElement, Event> = event => {
    setTabIndex(parseInt((event.target as HTMLInputElement).value, 10));
  };

  const handleTabsChange = (index: number) => {
    setTabIndex(index);
  };

  const previousLink: ContextualNavLink = {
    href: "/docs/navigation/breadcrumb",
    label: "Breadcrumb",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/feedback/alert",
    label: "Alert",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#import", label: "Import" },
    { href: "#usage", label: "Usage" },
    { href: "#colors", label: "Tabs colors", indent: true },
    { href: "#sizes", label: "Tabs sizes", indent: true },
    { href: "#variants", label: "Tabs variants", indent: true },
    { href: "#aligments", label: "Tabs aligments", indent: true },
    { href: "#orientation", label: "Tabs orientation", indent: true },
    { href: "#fitted-tabs", label: "Fitted tabs", indent: true },
    { href: "#disabled-tab", label: "Disabled tab", indent: true },
    { href: "#initial-active-tab", label: "Make a tab initially active", indent: true },
    { href: "#keep-alive", label: "Keeping tab panels alive", indent: true },
    { href: "#controlled-tabs", label: "Controlled tabs", indent: true },
    { href: "#accessibility", label: "Accessibility" },
    { href: "#theming", label: "Theming" },
    { href: "#props", label: "Props" },
    { href: "#tabs-props", label: "Tabs props", indent: true },
    { href: "#tab-props", label: "Tab props", indent: true },
    { href: "#other-components-props", label: "Other components props", indent: true },
  ];

  const tabsPropItems: PropsTableItem[] = [
    {
      name: "variant",
      description: "The visual style of the tabs.",
      type: '"underline" | "outline" | "cards" | "pills"',
      defaultValue: '"underline"',
    },
    {
      name: "colorScheme",
      description: "The color of the tabs.",
      type: '"primary" | "accent" | "neutral" | "success" | "info" | "warning" | "danger"',
      defaultValue: '"primary"',
    },
    {
      name: "size",
      description: "The size of the tabs.",
      type: '"sm" | "md" | "lg"',
      defaultValue: '"md"',
    },
    {
      name: "alignment",
      description: "The alignment of the tabs.",
      type: '"start" | "center" | "apart" | "end"',
      defaultValue: '"start"',
    },
    {
      name: "orientation",
      description: "The orientation of the tabs.",
      type: '"horizontal" | "vertical"',
      defaultValue: '"horizontal"',
    },
    {
      name: "fitted",
      description: "If `true`, the tabs will stretch to fit the container.",
      type: "boolean",
      defaultValue: "false",
    },
    {
      name: "keepAlive",
      description: "If `true`, the content of inactive tab panels stays mounted when unselected.",
      type: "boolean",
      defaultValue: "false",
    },
    {
      name: "index",
      description: "The index of the selected tab (in controlled mode).",
      type: "number",
    },
    {
      name: "defaultIndex",
      description: "The initial index of the selected tab (in uncontrolled mode).",
      type: "number",
      defaultValue: "0",
    },
    {
      name: "id",
      description: "The id of the tabs component.",
      type: "string",
    },
    {
      name: "onChange",
      description:
        "Callback invoked when the tabs index changes (in controlled or un-controlled modes).",
      type: "(index: number) => void",
    },
  ];

  const tabPropItems: PropsTableItem[] = [
    {
      name: "id",
      description: "The `id` of the tab.",
      type: "string",
    },
    {
      name: "panelId",
      description: "The `id` of the tab panel associated to this tab.",
      type: "string",
    },
    {
      name: "disabled",
      description: "If `true`, the tab will be disabled.",
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
      <PageTitle>Tabs</PageTitle>
      <Text mb="$5">
        An accessible tabs component that provides keyboard interactions and ARIA attributes
        described in the{" "}
        <Anchor
          href="https://www.w3.org/TR/wai-aria-practices-1.2/#tabpanel"
          external
          color="$primary11"
          fontWeight="$semibold"
        >
          WAI-ARIA Tabs
        </Anchor>{" "}
        design pattern.
      </Text>
      <SectionTitle id="import">Import</SectionTitle>
      <CodeSnippet snippet={snippets.importComponent} mb="$6" />
      <UnorderedList spacing="$2" mb="$12">
        <ListItem>
          <strong>Tabs:</strong> Provides context for all its children.
        </ListItem>
        <ListItem>
          <strong>TabList:</strong> Wrapper for the <Code>Tab</Code> components.
        </ListItem>
        <ListItem>
          <strong>Tab:</strong> Element that serves as a label for one of the tab panels and can be
          activated to display that panel.
        </ListItem>
        <ListItem>
          <strong>TabPanel:</strong> Element that contains the content associated with a tab.
        </ListItem>
      </UnorderedList>
      <SectionTitle id="usage">Usage</SectionTitle>
      <Text mb="$5"></Text>
      <Preview snippet={snippets.basicUsage} mb="$10">
        <Tabs>
          <TabList>
            <Tab>One</Tab>
            <Tab>Two</Tab>
            <Tab>Three</Tab>
          </TabList>
          <TabPanel>1</TabPanel>
          <TabPanel>2</TabPanel>
          <TabPanel>3</TabPanel>
        </Tabs>
      </Preview>
      <SectionSubtitle id="colors">Tabs colors</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>colorScheme</Code> prop to change the color of the Tabs. You can set the value
        to <Code>primary</Code>, <Code>accent</Code>, <Code>neutral</Code>, <Code>success</Code>,{" "}
        <Code>info</Code>, <Code>warning</Code> or <Code>danger</Code>.
      </Text>
      <Preview snippet={snippets.colors} mb="$10">
        <VStack alignItems="stretch" spacing="$4">
          <For each={["primary", "accent", "neutral", "success", "info", "warning", "danger"]}>
            {colorScheme => (
              <Tabs colorScheme={colorScheme as TabsProps["colorScheme"]}>
                <TabList>
                  <Tab>One</Tab>
                  <Tab>Two</Tab>
                  <Tab>Three</Tab>
                </TabList>
                <TabPanel>1</TabPanel>
                <TabPanel>2</TabPanel>
                <TabPanel>3</TabPanel>
              </Tabs>
            )}
          </For>
        </VStack>
      </Preview>
      <SectionSubtitle id="sizes">Tabs sizes</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>size</Code> prop to change the size of the Tabs. You can set the value to{" "}
        <Code>sm</Code>, <Code>md</Code> or <Code>lg</Code>.
      </Text>
      <Preview snippet={snippets.sizes} mb="$10">
        <VStack alignItems="stretch" spacing="$4">
          <For each={["sm", "md", "lg"]}>
            {size => (
              <Tabs size={size as TabsProps["size"]}>
                <TabList>
                  <Tab>One</Tab>
                  <Tab>Two</Tab>
                  <Tab>Three</Tab>
                </TabList>
                <TabPanel>1</TabPanel>
                <TabPanel>2</TabPanel>
                <TabPanel>3</TabPanel>
              </Tabs>
            )}
          </For>
        </VStack>
      </Preview>
      <SectionSubtitle id="variants">Tabs variants</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>variant</Code> prop to change the visual style of the Tabs. You can set the
        value to <Code>underline</Code>, <Code>outline</Code>, <Code>cards</Code> or{" "}
        <Code>pills</Code>.
      </Text>
      <Preview snippet={snippets.variants} mb="$10">
        <VStack alignItems="stretch" spacing="$4">
          <For each={["underline", "outline", "cards", "pills"]}>
            {variant => (
              <Tabs variant={variant as TabsProps["variant"]}>
                <TabList>
                  <Tab>One</Tab>
                  <Tab>Two</Tab>
                  <Tab>Three</Tab>
                </TabList>
                <TabPanel>1</TabPanel>
                <TabPanel>2</TabPanel>
                <TabPanel>3</TabPanel>
              </Tabs>
            )}
          </For>
        </VStack>
      </Preview>
      <SectionSubtitle id="aligments">Tabs aligments</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>aligment</Code> prop to change the alignment of the <Code>TabList</Code>. You
        can set the value to <Code>start</Code>, <Code>center</Code>, <Code>apart</Code> or{" "}
        <Code>end</Code>.
      </Text>
      <Preview snippet={snippets.aligments} mb="$10">
        <VStack alignItems="stretch" spacing="$4">
          <For each={["start", "center", "apart", "end"]}>
            {alignment => (
              <Tabs alignment={alignment as TabsProps["alignment"]}>
                <TabList>
                  <Tab>One</Tab>
                  <Tab>Two</Tab>
                  <Tab>Three</Tab>
                </TabList>
                <TabPanel>1</TabPanel>
                <TabPanel>2</TabPanel>
                <TabPanel>3</TabPanel>
              </Tabs>
            )}
          </For>
        </VStack>
      </Preview>
      <SectionSubtitle id="orientation">Tabs orientation</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>orientation</Code> prop to change the orientation of the Tabs. You can set the
        value to <Code>horizontal</Code> or <Code>vertical</Code>.
      </Text>
      <Preview snippet={snippets.orientation} mb="$10">
        <Tabs orientation="vertical">
          <TabList>
            <Tab>One</Tab>
            <Tab>Two</Tab>
            <Tab>Three</Tab>
          </TabList>
          <TabPanel>1</TabPanel>
          <TabPanel>2</TabPanel>
          <TabPanel>3</TabPanel>
        </Tabs>
      </Preview>
      <SectionSubtitle id="fitted-tabs">Fitted tabs</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>fitted</Code> prop to stretch the tab list to fit the container.
      </Text>
      <Preview snippet={snippets.fitted} mb="$10">
        <Tabs fitted>
          <TabList>
            <Tab>One</Tab>
            <Tab>Two</Tab>
            <Tab>Three</Tab>
          </TabList>
          <TabPanel>1</TabPanel>
          <TabPanel>2</TabPanel>
          <TabPanel>3</TabPanel>
        </Tabs>
      </Preview>
      <SectionSubtitle id="disabled-tab">Disabled tab</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>disabled</Code> prop to disabled a <Code>Tab</Code>. When a <Code>Tab</Code>{" "}
        is disabled, it is skipped during keyboard navigation and it is not clickable.
      </Text>
      <Preview snippet={snippets.disabled} mb="$10">
        <Tabs>
          <TabList>
            <Tab>One</Tab>
            <Tab disabled>Two</Tab>
            <Tab>Three</Tab>
          </TabList>
          <TabPanel>1</TabPanel>
          <TabPanel>2</TabPanel>
          <TabPanel>3</TabPanel>
        </Tabs>
      </Preview>
      <SectionSubtitle id="initial-active-tab">Make a tab initially active</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>defaultIndex</Code> prop to set a <Code>Tab</Code> initially active. Indexes
        start at 0.
      </Text>
      <Preview snippet={snippets.initialActive} mb="$10">
        <Tabs defaultIndex={1}>
          <TabList>
            <Tab>One</Tab>
            <Tab>Two</Tab>
            <Tab>Three</Tab>
          </TabList>
          <TabPanel>1</TabPanel>
          <TabPanel>2</TabPanel>
          <TabPanel>3</TabPanel>
        </Tabs>
      </Preview>
      <SectionSubtitle id="keep-alive">Keeping tab panels alive</SectionSubtitle>
      <Text mb="$5">
        By default, when you switch between tabs the state of the tab panels are lost, use the{" "}
        <Code>keepAlive</Code> prop to keep tab panels alive even when there's not visible.
      </Text>
      <Preview snippet={snippets.keepAlive} mb="$10">
        <VStack alignItems="stretch" spacing="$4">
          <Tabs>
            <TabList>
              <Tab>One</Tab>
              <Tab>Two</Tab>
              <Tab>Three</Tab>
            </TabList>
            <TabPanel>
              <Input placeholder="Try typing, I lose my value when switching tabs" />
            </TabPanel>
            <TabPanel>2</TabPanel>
            <TabPanel>3</TabPanel>
          </Tabs>
          <Tabs keepAlive>
            <TabList>
              <Tab>One</Tab>
              <Tab>Two</Tab>
              <Tab>Three</Tab>
            </TabList>
            <TabPanel>
              <Input placeholder="Try typing, I stay alive when switching tabs" />
            </TabPanel>
            <TabPanel>2</TabPanel>
            <TabPanel>3</TabPanel>
          </Tabs>
        </VStack>
      </Preview>
      <SectionSubtitle id="controlled-tabs">Controlled tabs</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>index</Code> and <Code>onChange</Code> props to control the <Code>Tabs</Code>{" "}
        like form inputs.
      </Text>
      <Preview snippet={snippets.controlled} mb="$12">
        <input type="range" min="0" max="2" value={tabIndex()} onInput={handleSliderChange} />
        <Tabs index={tabIndex()} onChange={handleTabsChange}>
          <TabList>
            <Tab>One</Tab>
            <Tab>Two</Tab>
            <Tab>Three</Tab>
          </TabList>
          <TabPanel>
            <p>Click the tabs or pull the slider around</p>
          </TabPanel>
          <TabPanel>
            <p>Yeah yeah. What's up?</p>
          </TabPanel>
          <TabPanel>
            <p>Oh, hello there.</p>
          </TabPanel>
        </Tabs>
      </Preview>
      <SectionTitle id="accessibility">Accessibility</SectionTitle>
      <SectionSubtitle>ARIA roles and attributes</SectionSubtitle>
      <UnorderedList spacing="$2" mb="$8">
        <ListItem>
          <Code>TabList</Code> as <Code>role</Code> set to <Code>tablist</Code>.
        </ListItem>
        <ListItem>
          <Code>TabList</Code> as <Code>aria-orientation</Code> set to <Code>horizontal</Code> or{" "}
          <Code>vertical</Code> based on the value of the <Code>orientation</Code> prop.
        </ListItem>
        <ListItem>
          <Code>Tab</Code> as <Code>role</Code> set to <Code>tab</Code>.
        </ListItem>
        <ListItem>
          <Code>Tab</Code> as <Code>aria-selected</Code> set to <Code>true</Code> when its selected.
        </ListItem>
        <ListItem>
          <Code>Tab</Code> as <Code>aria-controls</Code> set to the <Code>id</Code> of its
          associated <Code>TabPanel</Code>.
        </ListItem>
        <ListItem>
          <Code>TabPanel</Code> as <Code>role</Code> set to <Code>tabpanel</Code>.
        </ListItem>
        <ListItem>
          <Code>TabPanel</Code> as <Code>aria-labelledby</Code> set to the <Code>id</Code> of the{" "}
          <Code>Tab</Code> that labels it.
        </ListItem>
      </UnorderedList>
      <SectionSubtitle>Keyboard support</SectionSubtitle>
      <UnorderedList spacing="$2" mb="$12">
        <ListItem>
          <Kbd>←</Kbd> moves focus to the previous tab (in horizontal orientation).
        </ListItem>
        <ListItem>
          <Kbd>→</Kbd> moves focus to the next tab (in horizontal orientation).
        </ListItem>
        <ListItem>
          <Kbd>↑</Kbd> moves focus to the previous tab (in vertical orientation).
        </ListItem>
        <ListItem>
          <Kbd>↓</Kbd> moves focus to the next tab (in vertical orientation).
        </ListItem>
        <ListItem>
          <Kbd>home</Kbd> moves focus to the first tab.
        </ListItem>
        <ListItem>
          <Kbd>end</Kbd> moves focus to the last tab.
        </ListItem>
        <ListItem>
          <Kbd>tab</Kbd> when focus moves into the tab list, places focus on the active tab element.
        </ListItem>
      </UnorderedList>
      <SectionTitle id="theming">Theming</SectionTitle>
      <Text mb="$5">
        <Code>Tabs</Code> base styles and default props can be overridden in the Hope UI theme
        configuration like below:
      </Text>
      <CodeSnippet lang="js" snippet={snippets.theming} mb="$12" />
      <SectionTitle id="props">Props</SectionTitle>
      <SectionSubtitle id="tabs-props">Tabs props</SectionSubtitle>
      <PropsTable items={tabsPropItems} mb="$10" />
      <SectionSubtitle id="tab-props">Tab props</SectionSubtitle>
      <PropsTable items={tabPropItems} mb="$10" />
      <SectionSubtitle id="other-components-props">Other components props</SectionSubtitle>
      <Text>
        <Code>TabList</Code>, <Code>TabPanels</Code> and <Code>TabPanel</Code> composes{" "}
        <Anchor
          as={Link}
          href="/docs/layout/box"
          external
          color="$primary11"
          fontWeight="$semibold"
        >
          Box
        </Anchor>
        .
      </Text>
    </PageLayout>
  );
}
