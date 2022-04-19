import {
  ListItem,
  Progress,
  ProgressIndicator,
  ProgressLabel,
  Text,
  UnorderedList,
  VStack,
} from "@hope-ui/solid";
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

export default function ProgressDoc() {
  const previousLink: ContextualNavLink = {
    href: "/docs/feedback/circular-progress",
    label: "CircularProgress",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/feedback/skeleton",
    label: "Skeleton",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#import", label: "Import" },
    { href: "#usage", label: "Usage" },
    { href: "#colors", label: "Progress color", indent: true },
    { href: "#sizes", label: "Progress sizes", indent: true },
    { href: "#with-label", label: "Progress with label", indent: true },
    { href: "#striped", label: "Progress with stripes", indent: true },
    { href: "#animated", label: "Animated progress", indent: true },
    { href: "#indeterminate", label: "Indeterminate progress", indent: true },
    { href: "#accessibility", label: "Accessibility" },
    { href: "#theming", label: "Theming" },
    { href: "#props", label: "Props" },
    { href: "#progress-props", label: "Progress props", indent: true },
    { href: "#progress-indicator-props", label: "ProgressIndicator props", indent: true },
  ];

  const progressPropItems: PropsTableItem[] = [
    {
      name: "trackColor",
      description: "The color of the progress track.",
      type: 'ColorProps["color"]',
      defaultValue: "$neutral4",
    },
    {
      name: "size",
      description: "The size of the progress.",
      type: '"xs" | "sm" | "md" | "lg"',
      defaultValue: '"md"',
    },
    {
      name: "value",
      description: "The `value` of the progress indicator.",
      type: "number",
    },
    {
      name: "indeterminate",
      description:
        "If `true`, the progress will be indeterminate and the `value` prop will be ignored.",
      type: "boolean",
    },
    {
      name: "min",
      description: "The minimum value of the progress.",
      type: "number",
      defaultValue: "0",
    },
    {
      name: "max",
      description: "The maximum value of the progress.",
      type: "number",
      defaultValue: "100",
    },
    {
      name: "valueText",
      description: "The desired `aria-valuetext` to use in place of the value.",
      type: "string",
    },
    {
      name: "getValueText",
      description:
        "A function that returns the desired `aria-valuetext` to use in place of the value.",
      type: "(value: number, percent: number) => string",
    },
  ];

  const progressIndicatorPropItems: PropsTableItem[] = [
    {
      name: "color",
      description: "The color of the progress indicator.",
      type: 'ColorProps["color"]',
      defaultValue: "$primary9",
    },
    {
      name: "striped",
      description: "If `true`, the progress indicator will show stripes.",
      type: "boolean",
    },
    {
      name: "animated",
      description: "If `true`, and striped is `true`, the stripes will be animated.",
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
      <PageTitle>Progress</PageTitle>
      <Text mb="$5">
        <Code>Progress</Code> is used to display the progress status for a task that takes a long
        time or consists of several steps.
      </Text>
      <SectionTitle id="import">Import</SectionTitle>
      <CodeSnippet snippet={snippets.importComponent} mb="$6" />
      <UnorderedList spacing="$2" mb="$12">
        <ListItem>
          <strong>Progress:</strong> The wrapper that provides context for its children.
        </ListItem>
        <ListItem>
          <strong>ProgressIndicator:</strong> The visual indicator of the progress.
        </ListItem>
        <ListItem>
          <strong>ProgressLabel:</strong> The textual representation of the progress.
        </ListItem>
      </UnorderedList>
      <SectionTitle id="usage">Usage</SectionTitle>
      <Preview snippet={snippets.basicUsage} mb="$10">
        <Progress value={80}>
          <ProgressIndicator />
        </Progress>
      </Preview>
      <SectionSubtitle id="colors">Progress color</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>color</Code> prop to change the color of the <Code>ProgressIndicator</Code>{" "}
        and the <Code>trackColor</Code> prop to change the color of the progress track (background).
      </Text>
      <Preview snippet={snippets.colors} mb="$10">
        <Progress trackColor="$info3" value={64}>
          <ProgressIndicator color="$info9" />
        </Progress>
      </Preview>
      <SectionSubtitle id="sizes">Progress sizes</SectionSubtitle>
      <Text mb="$2">
        Use the <Code>size</Code> prop to change the size of the Progress. You can set the value to{" "}
        <Code>xs</Code>, <Code>sm</Code>, <Code>md</Code> or <Code>lg</Code>.
      </Text>
      <Text mb="$5">
        You can also use the <Code>height</Code> prop to manually set a height.
      </Text>
      <Preview snippet={snippets.sizes} mb="$10">
        <VStack alignItems="stretch" spacing="$5">
          <Progress size="xs" value={20}>
            <ProgressIndicator />
          </Progress>
          <Progress size="sm" value={20}>
            <ProgressIndicator />
          </Progress>
          <Progress size="md" value={20}>
            <ProgressIndicator />
          </Progress>
          <Progress size="lg" value={20}>
            <ProgressIndicator />
          </Progress>
          <Progress height="32px" value={20}>
            <ProgressIndicator />
          </Progress>
        </VStack>
      </Preview>
      <SectionSubtitle id="with-label">Progress with label</SectionSubtitle>
      <Text mb="$5">
        You can set a label inside the propgress by using the <Code>ProgressLabel</Code> component.
        By default it will display the progress percentage.
      </Text>
      <Preview snippet={snippets.withLabel} mb="$12">
        <Progress size="lg" value={80}>
          <ProgressIndicator />
          <ProgressLabel />
        </Progress>
      </Preview>
      <SectionSubtitle id="striped">Progress with stripes</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>striped</Code> prop to apply stripes on the <Code>ProgressIndicator</Code>.
      </Text>
      <Preview snippet={snippets.striped} mb="$10">
        <Progress value={64}>
          <ProgressIndicator striped />
        </Progress>
      </Preview>
      <SectionSubtitle id="animated">Animated progress</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>animated</Code> prop to animate the progress stripes.
      </Text>
      <Preview snippet={snippets.animated} mb="$10">
        <Progress value={64}>
          <ProgressIndicator striped animated />
        </Progress>
      </Preview>
      <SectionSubtitle id="indeterminate">Indeterminate progress</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>indeterminate</Code> prop to set the progress in an indeterminate state.
      </Text>
      <Preview snippet={snippets.indeterminate} mb="$10">
        <Progress size="xs" indeterminate>
          <ProgressIndicator />
        </Progress>
      </Preview>
      <SectionTitle id="accessibility">Accessibility</SectionTitle>
      <UnorderedList spacing="$2" mb="$12">
        <ListItem>
          <Code>Progress</Code> has a <Code>role</Code> set to <Code>progressbar</Code> to denote
          that it is a progress.
        </ListItem>
        <ListItem>
          <Code>Progress</Code> has <Code>aria-valuenow</Code> set to the percentage completion
          value passed to the component, to ensure the progress percent is visible to screen
          readers.
        </ListItem>
      </UnorderedList>
      <SectionTitle id="theming">Theming</SectionTitle>
      <Text mb="$5">
        <Code>Progress</Code> base styles and default props can be overridden in the Hope UI theme
        configuration like below:
      </Text>
      <CodeSnippet lang="js" snippet={snippets.theming} mb="$12" />
      <SectionTitle id="props">Props</SectionTitle>
      <SectionSubtitle id="progress-props">Progress props</SectionSubtitle>
      <PropsTable items={progressPropItems} mb="$10" />
      <SectionSubtitle id="progress-indicator-props">ProgressIndicator props</SectionSubtitle>
      <PropsTable items={progressIndicatorPropItems} />
    </PageLayout>
  );
}
