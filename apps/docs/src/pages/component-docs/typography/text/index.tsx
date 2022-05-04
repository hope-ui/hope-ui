import { Text, VStack } from "@hope-ui/solid";
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

export default function TextDoc() {
  const previousLink: ContextualNavLink = {
    href: "/docs/typography/heading",
    label: "Heading",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/data-entry/checkbox",
    label: "Checkbox",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#import", label: "Import" },
    { href: "#usage", label: "Usage" },
    { href: "#changing-font-size", label: "Changing the font size", indent: true },
    { href: "#truncate-text", label: "Truncate text", indent: true },
    { href: "#override-style", label: "Override style", indent: true },
    { href: "#override-element", label: "Override the element", indent: true },
    { href: "#theming", label: "Theming" },
    { href: "#props", label: "Props" },
  ];

  const propItems: PropsTableItem[] = [
    {
      name: "size",
      description: "The size of the text. It apply a combination of `font-size` and `line-height`.",
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
      <PageTitle>Text</PageTitle>
      <Text mb="$8">
        <Code>Text</Code> component is the used to render text and paragraphs within an interface.
        It renders a <Code>p</Code> tag by default.
      </Text>
      <SectionTitle id="import">Import</SectionTitle>
      <CodeSnippet snippet={snippets.importComponent} mb="$12" />
      <SectionTitle id="usage">Usage</SectionTitle>
      <Preview snippet={snippets.basicUsage} mb="$12">
        <Text>I'm a Text</Text>
      </Preview>
      <SectionSubtitle id="changing-font-size">Changing the font size</SectionSubtitle>
      <Text mb="$5">
        To increase the font size of the text, you can pass the <Code>size</Code> prop. It apply a
        combination of <Code>fontSize</Code> and <Code>lineHeight</Code> for an optimal reading
        experience.
      </Text>
      <Preview snippet={snippets.sizes} mb="$12">
        <VStack spacing="$3" alignItems="flex-start">
          <Text size="9xl" noOfLines={1}>
            (9xl) The quick brown fox
          </Text>
          <Text size="8xl" noOfLines={1}>
            (8xl) The quick brown fox
          </Text>
          <Text size="7xl" noOfLines={1}>
            (7xl) The quick brown fox
          </Text>
          <Text size="6xl">(6xl) The quick brown fox</Text>
          <Text size="5xl">(5xl) The quick brown fox</Text>
          <Text size="4xl">(4xl) The quick brown fox</Text>
          <Text size="3xl">(3xl) The quick brown fox</Text>
          <Text size="2xl">(2xl) The quick brown fox</Text>
          <Text size="xl">(xl) The quick brown fox</Text>
          <Text size="lg">(lg) The quick brown fox</Text>
          <Text size="base">(base) The quick brown fox</Text>
          <Text size="sm">(sm) The quick brown fox</Text>
          <Text size="xs">(xs) The quick brown fox</Text>
        </VStack>
      </Preview>
      <SectionSubtitle id="truncate-text">Truncate text</SectionSubtitle>
      <Text mb="$5">
        If you'd like to truncate the text after a specific number of lines, pass the{" "}
        <Code>noOfLines</Code> prop and set it to the desired number of lines. It will render an
        ellipsis when the text exceeds the width of the viewport or <Code>maxWidth</Code> prop.
      </Text>
      <Preview snippet={snippets.truncateText} mb="$12">
        <Text noOfLines={1}>
          Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing
          industries for previewing layouts and visual mockups.
        </Text>
      </Preview>
      <SectionSubtitle id="override-style">Override style</SectionSubtitle>
      <Text mb="$5">
        You can change the entire style of the text via props. For example, to change the font size,
        pass the <Code>fontSize</Code> prop.
      </Text>
      <Preview snippet={snippets.overrideStyle} mb="$12">
        <Text fontSize="50px" color="tomato">
          I'm using a custom font-size value for this text
        </Text>
      </Preview>
      <SectionSubtitle id="override-element">Override the element</SectionSubtitle>
      <Text mb="$5">
        To override the element that gets rendered, pass the <Code>as</Code> prop. Use{" "}
        <strong>Inspect Element</strong> to see the element that gets rendered in html.
      </Text>
      <Preview snippet={snippets.overrideElement} mb="$12">
        <VStack alignItems="flex-start">
          <Text as="i">Italic</Text>
          <Text as="u">Underline</Text>
          <Text as="abbr">I18N</Text>
          <Text as="cite">Citation</Text>
          <Text as="del">Deleted</Text>
          <Text as="em">Emphasis</Text>
          <Text as="ins">Inserted</Text>
          <Text as="kbd">Ctrl + C</Text>
          <Text as="mark">Highlighted</Text>
          <Text as="s">Strikethrough</Text>
          <Text as="samp">Sample</Text>
          <Text as="sub">sub</Text>
          <Text as="sup">sup</Text>
        </VStack>
      </Preview>
      <SectionTitle id="theming">Theming</SectionTitle>
      <Text mb="$5">
        <Code>Text</Code> base styles and default props can be overridden in the Hope UI theme
        configuration like below:
      </Text>
      <CodeSnippet lang="js" snippet={snippets.theming} mb="$12" />
      <SectionTitle id="props">Props</SectionTitle>
      <PropsTable items={propItems} />
    </PageLayout>
  );
}
