import {
  CircularProgress,
  CircularProgressIndicator,
  CircularProgressLabel,
  ListItem,
  Text,
  UnorderedList,
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

export default function CircularProgressDoc() {
  const previousLink: ContextualNavLink = {
    href: "/docs/feedback/alert",
    label: "Alert",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/feedback/progress",
    label: "Progress",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#import", label: "Import" },
    { href: "#usage", label: "Usage" },
    { href: "#color", label: "CircularProgress color", indent: true },
    { href: "#size", label: "CircularProgress size", indent: true },
    { href: "#thickness", label: "CircularProgress thickness", indent: true },
    { href: "#with-round-cap", label: "CircularProgress with round cap", indent: true },
    { href: "#with-label", label: "CircularProgress with label", indent: true },
    { href: "#indeterminate", label: "Indeterminate progress", indent: true },
    { href: "#accessibility", label: "Accessibility" },
    { href: "#theming", label: "Theming" },
    { href: "#props", label: "Props" },
    { href: "#circular-progress-props", label: "CircularProgress props", indent: true },
    {
      href: "#circular-progress-indicator-props",
      label: "CircularProgressIndicator props",
      indent: true,
    },
  ];

  const circularProgressPropItems: PropsTableItem[] = [
    {
      name: "trackColor",
      description: "The color of the progress track.",
      type: 'ColorProps["color"]',
      defaultValue: "$neutral4",
    },
    {
      name: "size",
      description: "The size of the progress.",
      type: 'SizeProps["boxSize"]',
      defaultValue: "$12",
    },
    {
      name: "thickness",
      description: "The thickness of the progress.",
      type: "Property.StrokeWidth<SizeScaleValue> | number",
      defaultValue: "$2_5",
    },
    {
      name: "value",
      description: "The `value` of the progress indicator.",
      type: "number",
    },
    {
      name: "indeterminate",
      description: "If `true`, the progress will be indeterminate and the `value` prop will be ignored.",
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
      description: "A function that returns the desired `aria-valuetext` to use in place of the value.",
      type: "(value: number, percent: number) => string",
    },
  ];

  const circularProgressIndicatorPropItems: PropsTableItem[] = [
    {
      name: "color",
      description: "The color of the progress indicator.",
      type: 'ColorProps["color"]',
      defaultValue: "$primary9",
    },
    {
      name: "withRoundCaps",
      description: "If `true`, the caps of the progress indicator will be rounded.",
      type: "boolean",
      defaultValue: "false",
    },
  ];

  onMount(() => {
    Prism.highlightAll();
  });

  return (
    <PageLayout previousLink={previousLink} nextLink={nextLink} contextualNavLinks={contextualNavLinks}>
      <PageTitle>CircularProgress</PageTitle>
      <Text mb="$5">
        The <Code>CircularProgress</Code> component is used to indicate the progress for determinate and indeterminate
        processes.
      </Text>
      <SectionTitle id="import">Import</SectionTitle>
      <CodeSnippet snippet={snippets.importComponent} mb="$6" />
      <UnorderedList spacing="$2" mb="$12">
        <ListItem>
          <strong>CircularProgress:</strong> The wrapper that provides context for its children.
        </ListItem>
        <ListItem>
          <strong>CircularProgressIndicator:</strong> The visual indicator of the progress.
        </ListItem>
        <ListItem>
          <strong>CircularProgressLabel:</strong> The textual representation of the progress.
        </ListItem>
      </UnorderedList>
      <SectionTitle id="usage">Usage</SectionTitle>
      <Preview snippet={snippets.basicUsage} mb="$10">
        <CircularProgress value={80}>
          <CircularProgressIndicator />
        </CircularProgress>
      </Preview>
      <SectionSubtitle id="color">CircularProgress color</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>color</Code> prop to change the color of the <Code>CircularProgressIndicator</Code> and the{" "}
        <Code>trackColor</Code> prop to change the color of the progress track (background).
      </Text>
      <Preview snippet={snippets.color} mb="$10">
        <CircularProgress trackColor="$info3" value={64}>
          <CircularProgressIndicator color="$info9" />
        </CircularProgress>
      </Preview>
      <SectionSubtitle id="size">CircularProgress size</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>size</Code> prop to change the size of the progress.
      </Text>
      <Preview snippet={snippets.size} mb="$10">
        <CircularProgress value={30} size="120px">
          <CircularProgressIndicator />
        </CircularProgress>
      </Preview>
      <SectionSubtitle id="thickness">CircularProgress thickness</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>thickness</Code> prop to change the thickness of the progress.
      </Text>
      <Preview snippet={snippets.thickness} mb="$10">
        <CircularProgress value={59} size="100px" thickness="4px">
          <CircularProgressIndicator />
        </CircularProgress>
      </Preview>
      <SectionSubtitle id="with-round-cap">CircularProgress with round cap</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>withRoundCaps</Code> prop to set the <Code>CircularProgressIndicator</Code> caps rounded.
      </Text>
      <Preview snippet={snippets.withRoundCaps} mb="$10">
        <CircularProgress value={80}>
          <CircularProgressIndicator withRoundCaps />
        </CircularProgress>
      </Preview>
      <SectionSubtitle id="with-label">CircularProgress with label</SectionSubtitle>
      <Text mb="$5">
        You can set a label inside the propgress by using the <Code>CircularProgressLabel</Code> component. By default
        it will display the progress percentage.
      </Text>
      <Preview snippet={snippets.withLabel} mb="$10">
        <CircularProgress value={40}>
          <CircularProgressIndicator color="$success9" />
          <CircularProgressLabel />
        </CircularProgress>
      </Preview>
      <SectionSubtitle id="indeterminate">Indeterminate progress</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>indeterminate</Code> prop to set the progress in an indeterminate state.
      </Text>
      <Preview snippet={snippets.indeterminate} mb="$12">
        <CircularProgress indeterminate>
          <CircularProgressIndicator color="$success9" />
        </CircularProgress>
      </Preview>
      <SectionTitle id="accessibility">Accessibility</SectionTitle>
      <UnorderedList spacing="$2" mb="$12">
        <ListItem>
          <Code>CircularProgress</Code> has a <Code>role</Code> set to <Code>progressbar</Code> to denote that it is a
          progress.
        </ListItem>
        <ListItem>
          <Code>CircularProgress</Code> has <Code>aria-valuenow</Code> set to the percentage completion value passed to
          the component, to ensure the progress percent is visible to screen readers.
        </ListItem>
      </UnorderedList>
      <SectionTitle id="theming">Theming</SectionTitle>
      <Text mb="$5">
        <Code>CircularProgress</Code> base styles and default props can be overridden in the Hope UI theme configuration
        like below:
      </Text>
      <CodeSnippet lang="js" snippet={snippets.theming} mb="$12" />
      <SectionTitle id="props">Props</SectionTitle>
      <SectionSubtitle id="circular-progress-props">CircularProgress props</SectionSubtitle>
      <PropsTable items={circularProgressPropItems} mb="$10" />
      <SectionSubtitle id="circular-progress-indicator-props">CircularProgressIndicator props</SectionSubtitle>
      <PropsTable items={circularProgressIndicatorPropItems} />
    </PageLayout>
  );
}
