import { Alert, AlertDescription, Anchor, Heading, Text, VStack } from "@hope-ui/design-system";
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

import { snippets } from "./snippets";

export default function HeadingDoc() {
  const previousLink: ContextualNavLink = {
    href: "/docs/layout/stack",
    label: "Stack",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/typography/text",
    label: "Text",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#import", label: "Import" },
    { href: "#usage", label: "Usage" },
    { href: "#level", label: "Level", indent: true },
    { href: "#changing-font-size", label: "Changing the font size", indent: true },
    { href: "#truncate-text", label: "Truncate text", indent: true },
    { href: "#override-style", label: "Override style", indent: true },
    { href: "#theming", label: "Theming" },
    { href: "#props", label: "Props" },
  ];

  const propItems: PropsTableItem[] = [
    {
      name: "level",
      description: "The level of the heading. For example, level 3 renders an `h3`.",
      type: "1 | 2 | 3 | 4 | 5 | 6",
    },
    {
      name: "size",
      description: "The size of the text. A combination of `font-size` and `line-height`.",
      type: '"xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl"',
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
      <PageTitle>Heading</PageTitle>
      <Text mb="$5">
        <Code>Heading</Code> composes{" "}
        <Anchor as={Link} href="/docs/layout/box" color="$primary11" fontWeight="$semibold">
          Box
        </Anchor>{" "}
        so you can use all the style props and add responsive styles as well. It renders a semibold{" "}
        <Code>h2</Code> tag by default.
      </Text>
      <SectionTitle id="import">Import</SectionTitle>
      <CodeSnippet snippet={snippets.importComponent} mb="$12" />
      <SectionTitle id="usage">Usage</SectionTitle>
      <Preview snippet={snippets.basicUsage} mb="$12">
        <Heading>I'm a Heading</Heading>
      </Preview>
      <SectionSubtitle id="level">Level</SectionSubtitle>
      <Text mb="$5">
        To change the rendered <Code>h</Code> tag pass the <Code>level</Code> prop with a value from
        1 to 6. For example, level 3 will render an <Code>h3</Code>. Use{" "}
        <strong>Inspect Element</strong> to see the element that gets rendered in html.
      </Text>
      <Preview snippet={snippets.level} mb="$6">
        <VStack spacing="$3" alignItems="flex-start">
          <Heading level="1">The quick brown fox</Heading>
          <Heading level="2">The quick brown fox</Heading>
          <Heading level="3">The quick brown fox</Heading>
          <Heading level="4">The quick brown fox</Heading>
          <Heading level="5">The quick brown fox</Heading>
          <Heading level="6">The quick brown fox</Heading>
        </VStack>
      </Preview>
      <Alert status="warning" mb="$12">
        <AlertDescription>
          The <Code>level</Code> prop is primarily for semantic purpose as it does not alter the
          heading styles
        </AlertDescription>
      </Alert>
      <SectionSubtitle id="changing-font-size">Changing the font size</SectionSubtitle>
      <Text mb="$5">
        To increase the font size of the text, you can pass the <Code>size</Code> prop. It apply a
        combination of <Code>fontSize</Code> and <Code>lineHeight</Code> for an optimal reading
        experience.
      </Text>
      <Preview snippet={snippets.sizes} mb="$12">
        <VStack spacing="$3" alignItems="flex-start">
          <Heading size="9xl" noOfLines={1}>
            (9xl) The quick brown fox
          </Heading>
          <Heading size="8xl" noOfLines={1}>
            (8xl) The quick brown fox
          </Heading>
          <Heading size="7xl" noOfLines={1}>
            (7xl) The quick brown fox
          </Heading>
          <Heading size="6xl">(6xl) The quick brown fox</Heading>
          <Heading size="5xl">(5xl) The quick brown fox</Heading>
          <Heading size="4xl">(4xl) The quick brown fox</Heading>
          <Heading size="3xl">(3xl) The quick brown fox</Heading>
          <Heading size="2xl">(2xl) The quick brown fox</Heading>
          <Heading size="xl">(xl) The quick brown fox</Heading>
          <Heading size="lg">(lg) The quick brown fox</Heading>
          <Heading size="base">(base) The quick brown fox</Heading>
          <Heading size="sm">(sm) The quick brown fox</Heading>
          <Heading size="xs">(xs) The quick brown fox</Heading>
        </VStack>
      </Preview>
      <SectionSubtitle id="truncate-text">Truncate text</SectionSubtitle>
      <Text mb="$5">
        If you'd like to truncate the text after a specific number of lines, pass the{" "}
        <Code>noOfLines</Code> prop and set it to the desired number of lines. It will render an
        ellipsis when the text exceeds the width of the viewport or <Code>maxWidth</Code> prop.
      </Text>
      <Preview snippet={snippets.truncateText} mb="$12">
        <Heading noOfLines={1}>
          Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing
          industries for previewing layouts and visual mockups.
        </Heading>
      </Preview>
      <SectionSubtitle id="override-style">Override style</SectionSubtitle>
      <Text mb="$5">
        You can change the entire style of the text via props. For example, to change the font size,
        pass the <Code>fontSize</Code> prop.
      </Text>
      <Preview snippet={snippets.overrideStyle} mb="$12">
        <Heading fontSize="50px" color="tomato">
          I'm using a custom font-size value for this heading
        </Heading>
      </Preview>
      <SectionTitle id="theming">Theming</SectionTitle>
      <Text mb="$5">
        <Code>Heading</Code> base styles and default props can be overridden in the Hope UI theme
        configuration like below:
      </Text>
      <CodeSnippet lang="js" snippet={snippets.theming} mb="$12" />
      <SectionTitle id="props">Props</SectionTitle>
      <PropsTable items={propItems} />
    </PageLayout>
  );
}
