import { hope, HStack, Image, Text } from "@hope-ui/solid";
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

export default function ImageDoc() {
  const previousLink: ContextualNavLink = {
    href: "/docs/data-display/icon",
    label: "Icon",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/data-display/kbd",
    label: "Kbd",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#import", label: "Import" },
    { href: "#usage", label: "Usage" },
    { href: "#image-size", label: "Image size", indent: true },
    { href: "#image-with-border-radius", label: "Image with border radius", indent: true },
    { href: "#image-fallback", label: "Image fallback", indent: true },
    { href: "#props", label: "Props" },
  ];

  const propItems: PropsTableItem[] = [
    {
      name: "src",
      description: "The image `src` attribute.",
      type: "string",
    },
    {
      name: "srcSet",
      description: "The image `srcset` attribute.",
      type: "string",
    },
    {
      name: "sizes",
      description: " The image `sizes` attribute.",
      type: "string",
    },
    {
      name: "crossOrigin",
      description:
        "The key used to set the crossOrigin on the HTMLImageElement into which the image will be loaded. This tells the browser to request cross-origin access when trying to download the image data.",
      type: '"" | "anonymous" | "use-credentials"',
    },
    {
      name: "loading",
      description: "The image loading strategy.",
      type: '"eager" | "lazy"',
    },
    {
      name: "fallbackSrc",
      description:
        "Fallback image `src` to show if image is loading or image fails. Using a local image is recommended.",
      type: "string",
    },
    {
      name: "fallback",
      description: "Fallback element to show if image is loading or image fails.",
      type: "JSX.Element",
    },
    {
      name: "ignoreFallback",
      description: "If `true`, opt out of the `fallbackSrc` logic.",
      type: "boolean",
      defaultValue: "false",
    },
    {
      name: "align",
      description:
        "How to align the image within its bounds. It maps to css `object-position` property.",
      type: "Property.ObjectPosition",
    },
    {
      name: "fit",
      description: "How the image to fit within its bounds. It maps to css `object-fit` property.",
      type: "Property.ObjectFit",
    },
    {
      name: "onLoad",
      description: "A callback for when the image `src` has been loaded.",
      type: "JSX.EventHandlerUnion<HTMLImageElement, Event>",
    },
    {
      name: "onError",
      description: "A callback for when there was an error loading the image `src`.",
      type: "JSX.EventHandlerUnion<HTMLImageElement, Event>",
    },
    {
      name: "htmlWidth",
      description: "The native HTML `width` attribute to the passed to the `img`",
      type: "string | number",
    },
    {
      name: "htmlHeight",
      description: "The native HTML `height` attribute to the passed to the `img`",
      type: "string | number",
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
      <PageTitle>Image</PageTitle>
      <Text mb="$5">
        The <Code>Image</Code> component is used to display images.
      </Text>
      <SectionTitle id="import">Import</SectionTitle>
      <CodeSnippet snippet={snippets.importComponent} mb="$12" />
      <SectionTitle id="usage">Usage</SectionTitle>
      <Preview snippet={snippets.basicUsage} mb="$10">
        <Image boxSize="$sm" src="https://bit.ly/3pq0AcS" alt="Monkey D. Luffy" objectFit="cover" />
      </Preview>
      <SectionSubtitle id="image-size">Image size</SectionSubtitle>
      <Text mb="$5">
        The size of the image can be adjusted using the <Code>boxSize</Code> prop.
      </Text>
      <Preview snippet={snippets.size} mb="$10">
        <HStack alignItems="flex-start" spacing="$4">
          <Image
            boxSize="100px"
            src="https://bit.ly/3pq0AcS"
            alt="Monkey D. Luffy"
            objectFit="cover"
          />
          <Image
            boxSize="150px"
            src="https://bit.ly/3pq0AcS"
            alt="Monkey D. Luffy"
            objectFit="cover"
          />
          <Image
            boxSize="200px"
            src="https://bit.ly/3pq0AcS"
            alt="Monkey D. Luffy"
            objectFit="cover"
          />
        </HStack>
      </Preview>
      <SectionSubtitle id="image-with-border-radius">Image with border radius</SectionSubtitle>
      <Text mb="$5">
        The radius of the image can be adjusted using the <Code>borderRadius</Code> prop.
      </Text>
      <Preview snippet={snippets.borderRadius} mb="$10">
        <Image
          boxSize="150px"
          borderRadius="$full"
          src="https://bit.ly/3pq0AcS"
          alt="Monkey D. Luffy"
          objectFit="cover"
        />
      </Preview>
      <SectionSubtitle id="image-fallback">Image fallback</SectionSubtitle>
      <Text mb="$2">
        The <Code>Image</Code> component allows you provide a fallback placeholder. The placeholder
        is displayed when:
      </Text>
      <hope.ul ps="$6" mb="$5">
        <hope.li mb="$2">
          The <Code>fallback</Code> or <Code>fallbackSrc</Code> prop is provided.
        </hope.li>
        <hope.li mb="$2">
          The image provided in <Code>src</Code> is currently loading.
        </hope.li>
        <hope.li mb="$2">
          An error occurred while loading the image <Code>src</Code>.
        </hope.li>
        <hope.li>
          No <Code>src</Code> prop was passed.
        </hope.li>
      </hope.ul>
      <Text mb="$5">
        You can also opt out of this behavior by passing the <Code>ignoreFallback</Code> prop.
      </Text>
      <Preview snippet={snippets.fallbackSupport} mb="$12">
        <Image src="gibberish.png" fallbackSrc="https://via.placeholder.com/150" />
      </Preview>
      <SectionTitle id="props">Props</SectionTitle>
      <PropsTable items={propItems} />
    </PageLayout>
  );
}
