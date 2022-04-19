import {
  Alert,
  AlertDescription,
  Anchor,
  Box,
  hope,
  Image,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@hope-ui/solid";
import Prism from "prismjs";
import { For, onMount } from "solid-js";

import Code from "@/components/Code";
import CodeSnippet from "@/components/CodeSnippet";
import { ContextualNavLink } from "@/components/ContextualNav";
import PageLayout from "@/components/PageLayout";
import PageTitle from "@/components/PageTitle";
import { Preview } from "@/components/Preview";
import SectionTitle from "@/components/SectionTitle";

import { snippets } from "./snippets";

const breakpoints = [
  { name: "@initial", value: "none" },
  { name: "@sm", value: "@media (min-width: 640px)" },
  { name: "@md", value: "@media (min-width: 768px)" },
  { name: "@lg", value: "@media (min-width: 1024px)" },
  { name: "@xl", value: "@media (min-width: 1280px)" },
  { name: "@2xl", value: "@media (min-width: 1536px)" },
];

export default function ResponsiveStyles() {
  const previousLink: ContextualNavLink = {
    href: "/docs/features/create-styles",
    label: "Create styles",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/features/global-styles",
    label: "Global styles",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#the-object-syntax", label: "The object syntax" },
    { href: "#usage-with-css-prop", label: "Usage with the `css` prop" },
    { href: "#usage-with-css-function", label: "Usage with stitches `css` function" },
    { href: "#demo", label: "Demo" },
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
      <PageTitle>Responsive styles</PageTitle>
      <Text mb="$5">
        Hope UI supports responsive styles out of the box. Instead of manually adding{" "}
        <Code>@media</Code> queries and adding nested styles throughout your code, Hope UI allows
        you to use an object syntax to add mobile-first responsive styles.
      </Text>
      <Alert status="info" mb="$5">
        <AlertDescription>
          Hope UI use the <Code>@media(min-width)</Code> media query to ensure your interfaces are
          mobile-first.
        </AlertDescription>
      </Alert>
      <Text mb="$5">
        Responsive syntax relies on the following breakpoints defined in the Hope UI theme:
      </Text>
      <hope.div overflowX="auto" mb="$8">
        <Table dense>
          <Thead bg="$neutral2">
            <Tr>
              <Th>Name</Th>
              <Th>Value</Th>
            </Tr>
          </Thead>
          <Tbody color="$primary11" fontFamily="$mono">
            <For each={breakpoints}>
              {breakpoint => (
                <Tr>
                  <Td>{breakpoint.name}</Td>
                  <Td>{breakpoint.value}</Td>
                </Tr>
              )}
            </For>
          </Tbody>
        </Table>
      </hope.div>
      <Alert status="warning" mb="$8">
        <AlertDescription>
          Breakpoints are created during the <Code>createStitches</Code> call which occurs
          internally in Hope UI, for this reason it is currently not possible to customize
          breakpoint values.
        </AlertDescription>
      </Alert>
      <SectionTitle id="the-object-syntax">The object syntax</SectionTitle>
      <Text mb="$4">
        All style props accept an object as value for mobile-first responsive styles.
      </Text>
      <Text mb="$5">
        Let's say you have a <Code>Box</Code> with the following properties:
      </Text>
      <CodeSnippet snippet={snippets.initialBox} mb="$8" />
      <Text mb="$5">To make the width responsive here's what you need to do:</Text>
      <CodeSnippet snippet={snippets.boxWithResponsiveWidth} mb="$12" />
      <SectionTitle id="usage-with-css-prop">
        Usage with the <Code>css</Code> prop
      </SectionTitle>
      <Text mb="$5">
        When using responsive styles with the <Code>css</Code> prop you don't need the{" "}
        <Code>@initial</Code> breakpoint. It's like the normal way of creating mobile-first
        responsive styles in CSS.
      </Text>
      <CodeSnippet snippet={snippets.usageWithCssProp} mb="$5" />
      <Text mb="$8">
        If you want to learn more, check out the{" "}
        <Anchor
          href="https://stitches.dev/docs/breakpoints#using-breakpoints-in-the-style-objects"
          external
          color="$primary11"
          fontWeight="$semibold"
        >
          stitches
        </Anchor>{" "}
        documentation.
      </Text>
      <SectionTitle id="usage-with-css-function">
        Usage with stitches <Code>css</Code> function
      </SectionTitle>
      <Text mb="$5">
        Like style props, variant created with stitches <Code>css</Code> function support responsive
        styles.
      </Text>
      <CodeSnippet snippet={snippets.usageWithCssFunction} mb="$5" />
      <Text mb="$8">
        If you want to learn more, check out the{" "}
        <Anchor
          href="https://stitches.dev/docs/breakpoints#setting-an-initial-variant"
          external
          color="$primary11"
          fontWeight="$semibold"
        >
          stitches
        </Anchor>{" "}
        documentation.
      </Text>
      <SectionTitle id="demo">Demo</SectionTitle>
      <Text mb="$5">
        Here's a simple example of a marketing page component that uses a stacked layout on small
        screens, and a side-by-side layout on larger screens{" "}
        <strong>(resize your browser to see it in action):</strong>
      </Text>
      <Preview snippet={snippets.demo}>
        <Box p="$4" display={{ "@md": "flex" }}>
          <Box flexShrink={0}>
            <Image
              borderRadius="$lg"
              width={{ "@md": "$40" }}
              src="https://bit.ly/2jYM25F"
              alt="Woman paying for a purchase"
            />
          </Box>
          <Box mt={{ "@initial": "$4", "@md": 0 }} ml={{ "@md": "$6" }}>
            <Text
              fontWeight="$bold"
              textTransform="uppercase"
              fontSize="$sm"
              letterSpacing="$wide"
              color="$primary9"
            >
              Marketing
            </Text>
            <Anchor
              mt="$1"
              display="block"
              fontSize="$lg"
              lineHeight="$normal"
              fontWeight="$semibold"
              href="#"
            >
              Finding customers for your new business
            </Anchor>
            <Text mt="$2" color="$neutral11">
              Getting a new business off the ground is a lot of hard work. Here are five ideas you
              can use to find your first customers.
            </Text>
          </Box>
        </Box>
      </Preview>
    </PageLayout>
  );
}
