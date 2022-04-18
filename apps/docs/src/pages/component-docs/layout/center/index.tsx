import { Anchor, AspectRatio, Box, Center, hope, HStack, Text } from "@hope-ui/design-system";
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
import { IconPhone } from "@/icons/IconPhone";

import { snippets } from "./snippets";

export default function CenterDoc() {
  const previousLink: ContextualNavLink = {
    href: "/docs/layout/box",
    label: "Box",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/layout/container",
    label: "Container",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#import", label: "Import" },
    { href: "#usage", label: "Usage" },
    { href: "#with-icons", label: "With icons", indent: true },
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
      <PageTitle>Center</PageTitle>
      <Text mb="$5">Center is a layout component that centers its child within itself.</Text>
      <SectionTitle id="import">Import</SectionTitle>
      <CodeSnippet snippet={snippets.importComponent} mb="$12" />
      <SectionTitle id="usage">Usage</SectionTitle>
      <Text mb="$5">
        Put any child element inside it, give it any <Code>width</Code> or/and <Code>height</Code>,
        it'll ensure the child is centered.
      </Text>
      <Preview snippet={snippets.basicUsage} mb="$10">
        <Center bg="tomato" h="100px" color="white">
          This is the Center
        </Center>
      </Preview>
      <SectionSubtitle id="with-icons">With icons</SectionSubtitle>{" "}
      <Text mb="$5">Center can be used to create frames around icons or numbers.</Text>
      <Preview snippet={snippets.withIcons}>
        <HStack spacing="$2">
          <Center w="40px" h="40px" bg="tomato" color="white">
            <IconPhone />
          </Center>
          <Center w="40px" h="40px" bg="tomato" color="white">
            <Box as="span" fontWeight="$bold" fontSize="$lg">
              1
            </Box>
          </Center>
        </HStack>
      </Preview>
    </PageLayout>
  );
}
