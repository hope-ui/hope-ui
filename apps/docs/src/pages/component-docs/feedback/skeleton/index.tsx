import {
  Box,
  ListItem,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
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

export default function SkeletonDoc() {
  const previousLink: ContextualNavLink = {
    href: "/docs/feedback/progress",
    label: "Progress",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/feedback/spinner",
    label: "Spinner",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#import", label: "Import" },
    { href: "#usage", label: "Usage" },
    { href: "#circle-and-text", label: "Circle and text Skeleton", indent: true },
    { href: "#color", label: "Skeleton color", indent: true },
    {
      href: "#skip-when-content-is-loaded",
      label: "Skipping the skeleton when content is loaded",
      indent: true,
    },
    { href: "#props", label: "Props" },
    { href: "#skeleton-props", label: "Skeleton props", indent: true },
    { href: "#skeleton-circle-props", label: "SkeletonCircle props", indent: true },
    { href: "#skeleton-text-props", label: "SkeletonText props", indent: true },
  ];

  const skeletonPropItems: PropsTableItem[] = [
    {
      name: "startColor",
      description: "The color at the animation start.",
      type: 'ColorProps["backgroundColor"]',
    },
    {
      name: "endColor",
      description: "The color at the animation end.",
      type: 'ColorProps["backgroundColor"]',
    },
    {
      name: "loaded",
      description: "If `true`, it'll render its children with a nice fade animation.",
      type: "boolean",
    },
    {
      name: "speed",
      description: "The animation speed in CSS unit.",
      type: "Property.AnimationDuration",
      defaultValue: "800ms",
    },
    {
      name: "fadeDuration",
      description: "The loaded children fadeIn animation duration in CSS unit.",
      type: "Property.AnimationDuration",
      defaultValue: "400ms",
    },
  ];

  const skeletonCirclePropItems: PropsTableItem[] = [
    {
      name: "size",
      description: "The size of the circle.",
      type: 'SizeProps["boxSize"]',
      defaultValue: "2rem",
    },
  ];

  const skeletonTextPropItems: PropsTableItem[] = [
    {
      name: "noOfLines",
      description: "The number of skeleton text lines.",
      type: "number",
      defaultValue: "3",
    },
    {
      name: "spacing",
      description: "The space between each skeleton text line.",
      type: 'GridLayoutProps["gap"]',
      defaultValue: "0.5rem",
    },
    {
      name: "skeletonHeight",
      description: "The height of each skeleton text line.",
      type: 'SizeProps["height"]',
      defaultValue: "0.5rem",
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
      <PageTitle>Skeleton</PageTitle>
      <Text mb="$5">
        <Code>Skeleton</Code> is used to display the loading state of some components.
      </Text>
      <SectionTitle id="import">Import</SectionTitle>
      <CodeSnippet snippet={snippets.importComponent} mb="$6" />
      <UnorderedList spacing="$2" mb="$12">
        <ListItem>
          <strong>Skeleton:</strong> The base component that show the loading state.
        </ListItem>
        <ListItem>
          <strong>SkeletonCircle:</strong> A circular skeleton.
        </ListItem>
        <ListItem>
          <strong>SkeletonText:</strong> A skeleton that represents one or more lines of text.
        </ListItem>
      </UnorderedList>
      <SectionTitle id="usage">Usage</SectionTitle>
      <Text mb="$5">You can use it as a standalone component.</Text>
      <Preview snippet={snippets.basicUsageStandalone} mb="$8">
        <VStack alignItems="stretch" spacing="$2">
          <Skeleton height="20px" />
          <Skeleton height="20px" />
          <Skeleton height="20px" />
        </VStack>
      </Preview>
      <Text mb="$5">Or to wrap another component to take the same height and width.</Text>
      <Preview snippet={snippets.basicUsageWrapper} mb="$10">
        <Skeleton>
          <div>contents wrapped</div>
          <div>won't be visible</div>
        </Skeleton>
      </Preview>
      <SectionSubtitle id="circle-and-text">Circle and text Skeleton</SectionSubtitle>
      <Preview snippet={snippets.circleAndText} mb="$10">
        <Box p="$6" boxShadow="$lg" rounded="$sm" bg="$loContrast">
          <SkeletonCircle size="$10" />
          <SkeletonText mt="$4" noOfLines={4} spacing="$4" />
        </Box>
      </Preview>
      <SectionSubtitle id="color">Skeleton color</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>startColor</Code> and <Code>endColor</Code> props to change the animation
        color.
      </Text>
      <Preview snippet={snippets.color} mb="$10">
        <Skeleton startColor="tomato" endColor="orange" height="20px" />
      </Preview>
      <SectionSubtitle id="skip-when-content-is-loaded">
        Skipping the skeleton when content is loaded
      </SectionSubtitle>
      <Text mb="$5">
        Use the <Code>loaded</Code> prop to prevent the skeleton from rendering.
      </Text>
      <Preview snippet={snippets.skipping} mb="$12">
        <Skeleton loaded>
          <span>Hope UI is cool</span>
        </Skeleton>
      </Preview>
      <SectionTitle id="props">Props</SectionTitle>
      <SectionSubtitle id="skeleton-props">Skeleton props</SectionSubtitle>
      <PropsTable items={skeletonPropItems} mb="$10" />
      <SectionSubtitle id="skeleton-circle-props">SkeletonCircle props</SectionSubtitle>
      <PropsTable items={skeletonCirclePropItems} mb="$10" />
      <SectionSubtitle id="skeleton-text-props">SkeletonText props</SectionSubtitle>
      <PropsTable items={skeletonTextPropItems} />
    </PageLayout>
  );
}
