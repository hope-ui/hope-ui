import { Badge, Box, hope, Text } from "@hope-ui/solid";
import Prism from "prismjs";
import { For, onMount } from "solid-js";

import Code from "@/components/Code";
import CodeSnippet from "@/components/CodeSnippet";
import { ContextualNavLink } from "@/components/ContextualNav";
import PageLayout from "@/components/PageLayout";
import PageTitle from "@/components/PageTitle";
import { Preview } from "@/components/Preview";
import SectionTitle from "@/components/SectionTitle";
import { IconStar } from "@/icons/IconStar";

import { snippets } from "./snippets";

export default function BoxDoc() {
  const previousLink: ContextualNavLink = {
    href: "/docs/layout/aspect-ratio",
    label: "AspectRatio",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/layout/center",
    label: "Center",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#import", label: "Import" },
    { href: "#usage", label: "Usage" },
    { href: "#as-prop", label: "The `as` prop" },
  ];

  const property = {
    imageUrl: "https://bit.ly/2Z4KKcF",
    imageAlt: "Rear view of modern home with pool",
    beds: 3,
    baths: 2,
    title: "Modern home in city center in the heart of historic Los Angeles",
    formattedPrice: "$1,900.00",
    reviewCount: 34,
    rating: 4,
  };

  onMount(() => {
    Prism.highlightAll();
  });

  return (
    <PageLayout previousLink={previousLink} nextLink={nextLink} contextualNavLinks={contextualNavLinks}>
      <PageTitle>Box</PageTitle>
      <Text mb="$5">
        Box is the most abstract component on top of which all other Hope UI components are built. By default, it
        renders a <Code>div</Code> element.
      </Text>
      <Text mb="$2">The Box component is useful because it helps with 3 common use cases:</Text>
      <hope.ul ps="$6" mb="$8">
        <hope.li mb="$2">Create responsive layouts with ease.</hope.li>
        <hope.li mb="$2">Provide a shorthand way to pass styles via props.</hope.li>
        <hope.li>
          Compose new component and allow for override using the <Code>as</Code> prop.
        </hope.li>
      </hope.ul>
      <SectionTitle id="import">Import</SectionTitle>
      <CodeSnippet snippet={snippets.importComponent} mb="$12" />
      <SectionTitle id="usage">Usage</SectionTitle>
      <Preview snippet={snippets.basicUsage} mb="$8">
        <Box bg="tomato" w="100%" p="$4" color="white">
          This is the Box
        </Box>
      </Preview>
      <Text mb="$5">
        A more complexe example of composing with <Code>Box</Code>:
      </Text>
      <Preview snippet={snippets.complexeExample} mb="$12">
        <Box maxW="$sm" borderWidth="1px" borderColor="$neutral6" borderRadius="$lg" overflow="hidden">
          <Box as="img" src={property.imageUrl} alt={property.imageAlt} />
          <Box p="$6">
            <Box display="flex" alignItems="baseline">
              <Badge px="$2" colorScheme="primary" rounded="$full">
                New
              </Badge>
              <Box
                color="$neutral9"
                fontWeight="$bold"
                letterSpacing="$wide"
                fontSize="$xs"
                textTransform="uppercase"
                ml="$2"
              >
                {property.beds} beds &bull; {property.baths} baths
              </Box>
            </Box>

            <Box mt="$1" fontWeight="$semibold" as="h4" lineHeight="$tight" noOfLines={1}>
              {property.title}
            </Box>

            <Box>
              {property.formattedPrice}
              <Box as="span" color="$neutral11" fontSize="$sm">
                / wk
              </Box>
            </Box>

            <Box display="flex" mt="$2" alignItems="center">
              <For each={Array(5).fill("")}>
                {(_, i) => <IconStar color={i() < property.rating ? "$warning9" : "$neutral3"} />}
              </For>
              <Box as="span" ml="$2" color="$neutral11" fontSize="$sm">
                {property.reviewCount} reviews
              </Box>
            </Box>
          </Box>
        </Box>
      </Preview>
      <SectionTitle id="as-prop">
        The <Code>as</Code> prop
      </SectionTitle>
      <Text mb="$5">
        You can use the <Code>as</Code> prop to change the element render, just like styled-components.
      </Text>
      <Preview snippet={snippets.asProp}>
        <Box as="button" borderRadius="$md" bg="tomato" color="white" px="$4" h="$8">
          Button
        </Box>
      </Preview>
    </PageLayout>
  );
}
